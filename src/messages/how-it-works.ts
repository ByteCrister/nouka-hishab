import { APP_LOCALES } from "@/constants/common";

export const howItWorksMessages = {
  [APP_LOCALES.EN]: {
    hero: {
      title: "How NoukaHishab Works",
      subtitle: "The simplest way to manage your river transport business, from loading barki to calculating net profits.",
    },
    steps: {
      step1: {
        title: "1. Setup Your Fleet",
        desc: "Add your boats, record their capacities (CFT), engine details, and define sharing rules. Keep all documents and maintenance logs in one place.",
      },
      step2: {
        title: "2. Log Trips & Barki",
        desc: "Schedule a trip by selecting the source ghat. Record the exact amount of sand (barki) purchased and the purchase rate per CFT.",
      },
      step3: {
        title: "3. Track Expenses on the Go",
        desc: "Easily log trip expenses such as fuel (তেল), labor (লেবার), local tolls (টোল), and government royalty (ইজারা) as they happen.",
      },
      step4: {
        title: "4. Settle & Distribute Profits",
        desc: "Enter the final sale amount upon delivery. NoukaHishab automatically deducts expenses, calculates Mahajan commission, and shows the clear net profit for the boat owner.",
      },
    },
    cta: {
      title: "Ready to simplify your business?",
      subtitle: "Join the digital revolution of Bangladesh's river transport industry today.",
      button: "Start Free Trial",
    },
  },
  [APP_LOCALES.BN]: {
    hero: {
      title: "যেভাবে কাজ করে",
      subtitle: "নদীপথে ব্যবসা পরিচালনার সবচেয়ে সহজ উপায়—বারকি লোড থেকে শুরু করে নিট লাভ হিসাব করা পর্যন্ত।",
    },
    steps: {
      step1: {
        title: "১. আপনার নৌকা যুক্ত করুন",
        desc: "আপনার নৌকাগুলো সিস্টেমে যুক্ত করুন, ধারণক্ষমতা (সিএফটি) এবং ইঞ্জিনের তথ্য দিন। শেয়ারের নিয়ম ঠিক করুন এবং সমস্ত কাগজপত্র এক জায়গায় রাখুন।",
      },
      step2: {
        title: "২. ট্রিপ ও বারকি লগ করুন",
        desc: "ঘাট সিলেক্ট করে ট্রিপ শিডিউল করুন। কত সিএফটি বালু (বারকি) কেনা হলো এবং কেনার দর কত, তা সহজেই রেকর্ড করুন।",
      },
      step3: {
        title: "৩. তাৎক্ষণিক খরচ ট্র্যাক করুন",
        desc: "যাত্রাপথে জ্বালানি (তেল), শ্রমিক (লেবার), স্থানীয় টোল এবং সরকারি ইজারা এর মত খরচগুলো সাথে সাথেই লগ করুন।",
      },
      step4: {
        title: "৪. হিসাব ও লাভ বন্টন",
        desc: "ডেলিভারি শেষে বিক্রির পরিমাণ দিন। নৌকা হিসাব স্বয়ংক্রিয়ভাবে খরচ বাদ দিয়ে, মহাজন কমিশন হিসাব করে মাঝির নিট লাভ দেখিয়ে দেবে।",
      },
    },
    cta: {
      title: "আপনার ব্যবসাকে সহজ করতে প্রস্তুত?",
      subtitle: "আজই বাংলাদেশের নদীপথের ব্যবসার ডিজিটাল বিপ্লবে যুক্ত হোন।",
      button: "ফ্রি ট্রায়াল শুরু করুন",
    },
  },
} as const;
