import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    id: "faq-1",
    question: "What is RefRef?",
    answer:
      "RefRef is an open source, community-driven and free to use referral management software. It helps businesses implement and manage referral programs with features like personalized referral links, attribution tracking, and automated reward systems.",
  },
  {
    id: "faq-2",
    question: "How does RefRef work?",
    answer:
      "Once you integrate RefRef into your products, your users will get a personalized referral link that they can share to refer new users. RefRef takes care of attribution so that new signups are attributed to the referrers. It provides features such as payment integrations and reward systems to automate the reward process for both the referrer and the referee.",
  },
  {
    id: "faq-3",
    question: "How do I integrate RefRef with my product?",
    answer:
      "RefRef is built to be easy to integrate and powerful when customized. Visit our documentation to get started with step-by-step integration guides tailored to your specific platform or business needs.",
  },
  {
    id: "faq-4",
    question: "What types of businesses can use RefRef?",
    answer:
      "While RefRef was originally built for referral programs for B2B SaaS (which was the authors' requirement), it now supports referral programs for other types of businesses too, including B2C software, ecommerce, fintech, and edtech, thanks to contributions from the community.",
  },
  {
    id: "faq-5",
    question: "Who created RefRef?",
    answer:
      "RefRef was created by Naomi Chopra and Haritabh Singh, co-founders of Hatica and Posium, for which they work full-time. They built RefRef to use for their own products and open-sourced it to build with the community.",
  },
  {
    id: "faq-6",
    question: "How can I contribute to RefRef?",
    answer:
      "Contributions are welcome! Visit our GitHub repository and create a Pull Request. Whether you're fixing bugs, adding features, improving documentation, or suggesting enhancements, your contributions help make RefRef better for everyone.",
  },
];

const FAQGeneral = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="text-center">
          <Badge className="text-xs font-medium">FAQ</Badge>
          <h1 className="mt-4 text-4xl font-semibold">
            Common Questions & Answers
          </h1>
          <p className="mt-6 font-medium text-muted-foreground">
            Get answers to common questions about RefRef's open source referral
            management platform.
          </p>
        </div>
        <div className="mx-auto mt-14 max-w-screen-sm">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-8 flex gap-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-xs text-primary">
                {index + 1}
              </span>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{faq.question}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQGeneral;
