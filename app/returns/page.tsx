import { PolicyPage } from "@/components/policy-page";

export default function ReturnsPage() {
  return <PolicyPage eyebrow="Products and refunds" title="Returns." intro="These arrangements apply to physical goods. Services, courses and appointments follow the separate cancellation terms." sections={[
    { title: "Requesting a return", body: "Request a return within 14 days after receiving the item. It must be unused, with any tags, in its original packaging and accompanied by proof of purchase. Contact the branch before sending anything: West Street at info@pinkbeautysalons.co.uk, or Watlington Street at pinkclinicreading@gmail.com. Unauthorised returns may not be accepted." },
    { title: "Return addresses", body: "Accepted West Street returns are sent to 4–5 West Street, Reading RG1 1TT. Accepted Watlington Street returns are sent to 25 Watlington Street, Reading RG1 4EN. The branch will provide return instructions and confirm who is responsible for return postage." },
    { title: "Exceptions", body: "Opened or used personal-care and beauty products cannot normally be returned for hygiene reasons. Custom or personalised items, hazardous or perishable goods, gift cards and sale items may also be excluded, except where the law requires otherwise. Contact the branch if you are unsure before purchasing." },
    { title: "Damaged, incorrect or faulty items", body: "Inspect the order when it arrives and contact the relevant branch promptly if it is damaged, defective or incorrect. Include the order details and photographs where useful. Your statutory rights for faulty or misdescribed goods are not affected." },
    { title: "Refund timing", body: "After an accepted return is received and inspected, the branch will confirm whether the refund is approved. Approved refunds are issued to the original payment method, normally within 10 business days; the bank or payment provider may need additional processing time." },
  ]} />;
}
