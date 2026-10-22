#!/usr/bin/env python3
"""Configure only Pink's application monitoring. Dry-run unless --apply is supplied."""
import argparse
import json
import boto3

ACCOUNT = "417731044164"
APP = "dex0d2j1ekar0"
REGION = "eu-west-2"
GROUP = f"/aws/amplify/{APP}"
NAMESPACE = f"PinkClinic/{APP}"
FILTERS = {
    "ApplicationErrors": "%severity.*ERROR%",
    "ClientErrors": "%client_error%",
    "SessionExpiries": "%consultation_session_expired%",
    "ValidationFailures": "%consultation_validation_failed%",
    "DraftAutosaves": "%consultation_autosave_succeeded%",
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--email", required=True)
    args = parser.parse_args()
    session = boto3.Session(region_name=REGION)
    actual = session.client("sts").get_caller_identity()["Account"]
    if actual != ACCOUNT:
        raise SystemExit(f"Wrong AWS account: {actual}; expected Pink {ACCOUNT}. No changes made.")
    logs = session.client("logs")
    groups = logs.describe_log_groups(logGroupNamePrefix=GROUP)["logGroups"]
    group = next((group for group in groups if group["logGroupName"] == GROUP), None)
    if not group:
        raise SystemExit("Pink's existing log group was not found.")
    sample = json.dumps({"service": "pink-clinic", "severity": "ERROR", "event": "server_error"})
    assert len(logs.test_metric_filter(filterPattern=FILTERS["ApplicationErrors"], logEventMessages=[sample, "2026-10-21 runtime ERROR " + sample])["matches"]) == 2
    if not args.apply:
        print(json.dumps({"account": actual, "logGroup": GROUP, "metricFilters": FILTERS, "alarms": 4, "dashboard": "PinkClinic-Application", "apply": False}))
        return
    sns = session.client("sns")
    cloudwatch = session.client("cloudwatch")
    topic = sns.create_topic(Name="PinkClinic-Application-Alerts")["TopicArn"]
    policy = json.loads(sns.get_topic_attributes(TopicArn=topic)["Attributes"]["Policy"])
    policy["Statement"] = [statement for statement in policy["Statement"] if statement.get("Sid") != "AllowPinkCloudWatchAlarms"]
    policy["Statement"].append({
        "Sid": "AllowPinkCloudWatchAlarms", "Effect": "Allow",
        "Principal": {"Service": "cloudwatch.amazonaws.com"}, "Action": "SNS:Publish", "Resource": topic,
        "Condition": {"StringEquals": {"aws:SourceAccount": ACCOUNT}, "ArnLike": {"aws:SourceArn": f"arn:aws:cloudwatch:{REGION}:{ACCOUNT}:alarm:PinkClinic-*"}},
    })
    sns.set_topic_attributes(TopicArn=topic, AttributeName="Policy", AttributeValue=json.dumps(policy))
    subscriptions = []
    for page in sns.get_paginator("list_subscriptions_by_topic").paginate(TopicArn=topic):
        subscriptions.extend(page["Subscriptions"])
    if not any(sub["Protocol"] == "email" and sub["Endpoint"] == args.email for sub in subscriptions):
        subscription = sns.subscribe(TopicArn=topic, Protocol="email", Endpoint=args.email, ReturnSubscriptionArn=True)["SubscriptionArn"]
    else:
        subscription = next(sub["SubscriptionArn"] for sub in subscriptions if sub["Protocol"] == "email" and sub["Endpoint"] == args.email)
    pending = not subscription.startswith("arn:") or sns.get_subscription_attributes(SubscriptionArn=subscription)["Attributes"].get("PendingConfirmation") == "true"
    for name, pattern in FILTERS.items():
        logs.put_metric_filter(logGroupName=GROUP, filterName=f"PinkClinic-{name}", filterPattern=pattern,
            metricTransformations=[{"metricName": name, "metricNamespace": NAMESPACE, "metricValue": "1", "defaultValue": 0.0, "unit": "Count"}])
    # Never shorten or delete historical log retention.
    retention = group.get("retentionInDays")
    if retention is not None and retention < 30:
        logs.put_retention_policy(logGroupName=GROUP, retentionInDays=30)
    alarms = [
        ("ApplicationErrors", NAMESPACE, "ApplicationErrors", [], 1, 300),
        ("ClientErrorBurst", NAMESPACE, "ClientErrors", [], 3, 300),
        ("SessionExpiryBurst", NAMESPACE, "SessionExpiries", [], 5, 900),
        ("Hosting5xx", "AWS/AmplifyHosting", "5xxErrors", [{"Name": "App", "Value": APP}], 1, 300),
    ]
    for suffix, namespace, metric, dimensions, threshold, period in alarms:
        cloudwatch.put_metric_alarm(AlarmName=f"PinkClinic-{suffix}",
            AlarmDescription=f"Pink {APP}/main: {metric} >= {threshold} over {period} seconds. See /aws/amplify/{APP}; no client data is included in notifications.",
            Namespace=namespace, MetricName=metric, Dimensions=dimensions, Statistic="Sum", Period=period,
            EvaluationPeriods=1, DatapointsToAlarm=1, Threshold=threshold, ComparisonOperator="GreaterThanOrEqualToThreshold",
            TreatMissingData="notBreaching", ActionsEnabled=True, AlarmActions=[topic], OKActions=[topic])
    metrics = [[NAMESPACE, metric] for metric in FILTERS]
    metrics.append(["AWS/AmplifyHosting", "5xxErrors", "App", APP])
    dashboard = {"widgets": [
        {"type": "metric", "x": 0, "y": 0, "width": 24, "height": 8, "properties": {"title": "Pink consultation and application health", "region": REGION, "metrics": metrics, "period": 300, "stat": "Sum", "view": "timeSeries"}},
        {"type": "log", "x": 0, "y": 8, "width": 24, "height": 8, "properties": {"title": "Recent structured application events (no form contents)", "region": REGION, "query": f"SOURCE '{GROUP}' | fields @timestamp, @message | filter @message like /pink-clinic/ | sort @timestamp desc | limit 100", "view": "table"}},
    ]}
    result = cloudwatch.put_dashboard(DashboardName="PinkClinic-Application", DashboardBody=json.dumps(dashboard))
    assert not result.get("DashboardValidationMessages"), result.get("DashboardValidationMessages")
    print(json.dumps({"account": actual, "topicArn": topic, "subscription": "pending confirmation" if pending else "confirmed", "metricFilters": len(FILTERS), "alarms": len(alarms), "dashboard": "PinkClinic-Application", "retentionDays": retention or "unlimited (preserved)"}))


if __name__ == "__main__":
    main()
