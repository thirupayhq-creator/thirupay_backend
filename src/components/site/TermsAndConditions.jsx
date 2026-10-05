import { useState, useEffect, useRef } from "react";

const SECTIONS = [
  {
    id: "general-terms",
    title: "1. General Terms",
    body: (
      <>
        <Bullets
          items={[
            "Section headings are for convenience only and do not carry independent legal weight beyond helping you navigate this document.",
            "Your use of the Platform is governed by these Terms and our Privacy Policy, both of which we may update from time to time at our discretion. Continued use after an update means you accept the revised Terms.",
            "These Terms and the Privacy Policy are linked: if one is terminated or expires, the other ends with it.",
          ]}
        />
      </>
    ),
  },
  {
    id: "registration",
    title: "2. Registration",
    body: (
      <P>
        Creating a merchant account is required to collect payments through
        ThiruPay. Registration is only considered complete once we've
        verified your mobile number or email, and any KYC details required
        for payment collection.
      </P>
    ),
  },
  {
    id: "eligibility",
    title: "3. Eligibility",
    body: (
      <Bullets
        items={[
          "You confirm that you are legally competent to enter into a binding contract under Indian law. If a minor uses the Platform, it must be under the supervision and with the consent of a legal guardian, who bears responsibility for that use.",
          "You agree to follow these Terms along with all applicable local, state, and national laws.",
          "You may not use the Platform if any law or regulation disqualifies you from entering into contracts.",
        ]}
      />
    ),
  },
  {
    id: "platform-overview",
    title: "4. Platform Overview",
    body: (
      <P>
        ThiruPay helps small businesses across Tamil Nadu collect payments
        through UPI QR codes and shareable payment links. Depending on the
        plan you choose, the Platform may also support tracking of
        collections, basic reporting, and payout visibility. Features may be
        added, changed, or withdrawn as the product evolves, and are subject
        to the settlement and operating guidelines applicable to payment
        collection in India.
      </P>
    ),
  },
  {
    id: "content",
    title: "5. Content",
    body: (
      <P>
        Text, graphics, interfaces, photographs, trademarks, logos, and other
        material on the Platform (collectively, "Content") may be created by
        us, by Users, or by third parties. We don't guarantee the accuracy or
        genuineness of Content supplied by Users or third parties, and we
        aren't liable for it. Content on the Platform is protected by
        copyright and may not be reused without written permission. We may
        suspend or close any account that submits content we determine, at
        our discretion, to be false, misleading, offensive, or unlawful.
      </P>
    ),
  },
  {
    id: "indemnity",
    title: "6. Indemnity",
    body: (
      <P>
        You agree to defend and hold ThiruPay, its directors, officers, and
        employees harmless against losses, claims, and costs (including
        legal fees) arising from: your use of the Platform, your breach of
        these Terms, your violation of someone else's rights, or your
        conduct in connection with the Platform.
      </P>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "7. Limitation Of Liability",
    body: (
      <P>
        We are not responsible for issues caused by factors outside our
        reasonable control, including internet connectivity problems,
        incorrect information you provide, delayed email communication, or
        third-party service outages. The Platform is provided without
        guarantees of uninterrupted or error-free operation, and you use it
        at your own risk.
      </P>
    ),
  },
  {
    id: "term",
    title: "8. Term",
    body: (
      <Bullets
        items={[
          "These Terms remain in effect for as long as you use the Platform.",
          "You may stop using the Platform at any time.",
          "We may suspend or close your account, or discontinue the Platform entirely, at our discretion — including without prior notice if we identify a legal or compliance concern.",
        ]}
      />
    ),
  },
  {
    id: "termination",
    title: "9. Termination",
    body: (
      <P>
        We reserve the right to restrict or end your access to the Platform
        at any time, for any reason, without prior notice. We may also deny
        access to anyone, at our sole discretion.
      </P>
    ),
  },
  {
    id: "communication",
    title: "10. Communication",
    body: (
      <P>
        By registering, you consent to receive calls, emails, or SMS from us
        related to your account and our services. If you spot an issue with
        the Platform or its content, you can reach us at{" "}
        <a href="mailto:support@thirupay.com" className="text-green-700 underline underline-offset-2 hover:text-green-900">
          support@thirupay.com
        </a>
        ; we'll look into it and respond once our review is complete.
      </P>
    ),
  },
  {
    id: "user-obligations",
    title: "11. User Obligations And Conduct",
    body: (
      <Bullets
        items={[
          "Provide genuine, accurate details during registration and keep them up to date.",
          "Keep your account credentials confidential and notify us immediately of any unauthorized use.",
          "Not impersonate any person or entity, or misrepresent your affiliation with one.",
          "Not probe, scan, or attempt to breach the security of the Platform or any connected network.",
          "Not interfere with or disrupt the Platform, its servers, or its services.",
        ]}
      />
    ),
  },
  {
    id: "refunds",
    title: "12. Refunds",
    body: (
      <P>
        Refunds for disputed payments are made to the original payment
        method used in the transaction. If a dispute isn't resolved to the
        satisfaction of us, our payment partners, or the relevant card
        network, we may recover the disputed amount from your account
        balance. Fees charged on a disputed transaction are non-refundable.
      </P>
    ),
  },
  {
    id: "suspension",
    title: "13. Suspension Of Access",
    body: (
      <P>
        We may, at our discretion, temporarily or permanently limit your
        access to the Platform without needing to provide advance notice,
        particularly where we suspect fraud, misuse, or a breach of these
        Terms.
      </P>
    ),
  },
  {
    id: "ip-rights",
    title: "14. Intellectual Property Rights",
    body: (
      <P>
        The ThiruPay name, logo, and all designs, graphics, and branding on
        the Platform belong to us or our licensors. Nothing in these Terms
        gives you rights to use our trademarks or brand assets except as
        needed to use the Platform as intended.
      </P>
    ),
  },
  {
    id: "disclaimer",
    title: "15. Disclaimer Of Warranties",
    body: (
      <P>
        You access the Platform at your own risk and using your own
        judgment. Any information, recommendations, or resources you get
        from the Platform don't create a warranty. We don't guarantee the
        Platform will be free of errors, interruptions, or harmful
        components. This section survives even after these Terms end.
      </P>
    ),
  },
  {
    id: "force-majeure",
    title: "16. Force Majeure",
    body: (
      <P>
        We won't be liable for delays or failures caused by events beyond
        our reasonable control, including natural disasters, internet or
        telecom outages, technical failures, labour disputes, or unlawful
        third-party interference.
      </P>
    ),
  },
  {
    id: "dispute-resolution",
    title: "17. Dispute Resolution And Jurisdiction",
    body: (
      <P>
        Any dispute arising from these Terms will first be addressed through
        good-faith discussion. If that fails, the dispute will be resolved
        through arbitration by a sole arbitrator appointed by us, conducted
        in English, with Chennai, India as the seat of arbitration. These
        Terms are governed by the laws of India.
      </P>
    ),
  },
  {
    id: "misc",
    title: "18. Miscellaneous Provisions",
    body: (
      <ul className="space-y-3 text-[15px] leading-relaxed text-gray-700">
        <li>
          <span className="font-semibold text-gray-900">Waiver: </span>
          Our failure to enforce any part of these Terms at any time doesn't
          waive our right to enforce it later.
        </li>
        <li>
          <span className="font-semibold text-gray-900">Severability: </span>
          If any clause is found invalid or unenforceable, the rest of these
          Terms remain in full effect, and the affected clause will be
          interpreted to reflect its original intent as closely as the law
          allows.
        </li>
        <li>
          <span className="font-semibold text-gray-900">Contact: </span>
          Questions about these Terms can be sent to{" "}
          <a href="mailto:support@thirupay.com" className="text-green-700 underline underline-offset-2 hover:text-green-900">
            support@thirupay.com
          </a>
          .
        </li>
      </ul>
    ),
  },
];

function P({ children }) {
  return <p className="text-[15px] leading-relaxed text-gray-700">{children}</p>;
}

function Bullets({ items }) {
  return (
    <ul className="space-y-3 text-[15px] leading-relaxed text-gray-700 list-disc pl-5 marker:text-green-600">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function TermsAndConditions() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-green-50/70 border-b border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Terms and Conditions
          </h1>
         
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12">
        {/* Sidebar */}
        <aside className="md:sticky md:top-8 self-start hidden md:block">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-5">
            Sections
          </p>
          <nav>
            <ul className="space-y-1 border-l-2 border-gray-100">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`block -ml-0.5 pl-4 py-2 text-sm border-l-2 transition-colors ${
                      active === s.id
                        ? "border-green-600 text-green-700 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <article>
          <div className="mb-12 space-y-4">
            <p className="text-[15px] leading-relaxed text-gray-700">
              Welcome to ThiruPay. This page explains the rules that apply
              when you use our website, mobile app, and payment collection
              services (together, the "Platform"). It is published in
              electronic form and does not require a physical or digital
              signature to be valid, in line with applicable Indian
              electronic-records law.
            </p>
            <p className="text-[15px] leading-relaxed text-gray-700">
              The Platform is operated by{" "}
              <strong className="text-gray-900">
                ThiruPay Technologies Private Limited
              </strong>{" "}
              ("ThiruPay", "we", "us", "our"), registered in Chennai, Tamil
              Nadu. By creating an account or using any part of the Platform,
              you ("you", "User") agree to be bound by these Terms and our
              Privacy Policy. Any other website, app, or individual not
              operated by us is referred to here as a "Third Party."
            </p>
          </div>

          {SECTIONS.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              ref={(el) => (sectionRefs.current[s.id] = el)}
              className={`scroll-mt-8 pb-10 mb-10 ${
                i !== SECTIONS.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}