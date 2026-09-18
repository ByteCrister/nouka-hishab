// src/lib/pdf/pdf-i18n.ts
// ─── PDF-specific i18n strings ────────────────────────────────────────────────
// These strings are used directly in @react-pdf/renderer document components.
// next-intl hooks cannot be used inside react-pdf documents (they are not
// rendered in the browser React tree), so we pass locale-resolved strings as
// props instead.
//
// Usage:
//   const strings = PDF_STRINGS['bn'];
//   <Text>{strings.header.title}</Text>

import type { AppLocale } from '@/constants/common.const';

export interface PdfStrings {
  header: {
    title: string;       // "NOUKA HISHAB"
    reportTitle: string; // "SAND TRIP REPORT"
  };
  meta: {
    boat: string;
    period: string;
    departure: string;
    arrival: string;
    part: string;
    of: string;
    generated: string;
  };
  table: {
    serial: string;
    date: string;
    route: string;
    cargo: string;
    sale: string;
    purchase: string;
    royalty: string;
    toll: string;
    operating: string;
    profit: string;
  };
  summary: {
    totalTrips: string;
    totalSale: string;
    totalPurchase: string;
    totalRoyalty: string;
    totalToll: string;
    totalOperating: string;
    netProfit: string;
  };
  expenses: {
    title: string;
    category: string;
    description: string;
    amount: string;
    categories: {
      fuel: string;
      labour: string;
      maintenance: string;
      toll_payment: string;
      loading_fee: string;
      engine_repair: string;
      other: string;
    };
  };
  misc: {
    noData: string;
    pageOf: string; // "Page {page} of {total}"
    confidential: string;
  };
}

const EN: PdfStrings = {
  header: {
    title: 'NOUKA HISHAB',
    reportTitle: 'SAND TRIP REPORT',
  },
  meta: {
    boat: 'Boat',
    period: 'Period',
    departure: 'Departure',
    arrival: 'Arrival',
    part: 'Part',
    of: 'of',
    generated: 'Generated',
  },
  table: {
    serial: '#',
    date: 'Date',
    route: 'Route',
    cargo: 'Cargo',
    sale: 'Sale (Tk)',
    purchase: 'Purchase (Tk)',
    royalty: 'Royalty (Tk)',
    toll: 'Toll (Tk)',
    operating: 'Operating (Tk)',
    profit: 'Profit (Tk)',
  },
  summary: {
    totalTrips: 'Total Trips',
    totalSale: 'Total Sale',
    totalPurchase: 'Total Purchase',
    totalRoyalty: 'Total Royalty',
    totalToll: 'Total Toll',
    totalOperating: 'Total Operating Cost',
    netProfit: 'Net Profit',
  },
  expenses: {
    title: 'Expense Breakdown',
    category: 'Category',
    description: 'Description',
    amount: 'Amount (Tk)',
    categories: {
      fuel: 'Fuel',
      labour: 'Labour',
      maintenance: 'Maintenance',
      toll_payment: 'Toll Payment',
      loading_fee: 'Loading Fee',
      engine_repair: 'Engine Repair',
      other: 'Other',
    },
  },
  misc: {
    noData: '—',
    pageOf: 'Page {page} of {total}',
    confidential: 'Confidential — for internal use only',
  },
};

const BN: PdfStrings = {
  header: {
    title: 'নৌকা হিসাব',
    reportTitle: 'বালি ট্রিপ রিপোর্ট',
  },
  meta: {
    boat: 'নৌকা',
    period: 'সময়কাল',
    departure: 'যাত্রা',
    arrival: 'গন্তব্যে পৌঁছানো',
    part: 'অংশ',
    of: 'এর মধ্যে',
    generated: 'তৈরি হয়েছে',
  },
  table: {
    serial: '#',
    date: 'তারিখ',
    route: 'রুট',
    cargo: 'পণ্য',
    sale: 'বিক্রয় (Tk)',
    purchase: 'ক্রয় (Tk)',
    royalty: 'রাজস্ব (Tk)',
    toll: 'টোল (Tk)',
    operating: 'পরিচালন (Tk)',
    profit: 'মুনাফা (Tk)',
  },
  summary: {
    totalTrips: 'মোট ট্রিপ',
    totalSale: 'মোট বিক্রয়',
    totalPurchase: 'মোট ক্রয়',
    totalRoyalty: 'মোট রাজস্ব',
    totalToll: 'মোট টোল',
    totalOperating: 'মোট পরিচালন খরচ',
    netProfit: 'নিট মুনাফা',
  },
  expenses: {
    title: 'খরচের বিবরণ',
    category: 'বিভাগ',
    description: 'বিবরণ',
    amount: 'পরিমাণ (Tk)',
    categories: {
      fuel: 'জ্বালানি',
      labour: 'শ্রম',
      maintenance: 'রক্ষণাবেক্ষণ',
      toll_payment: 'টোল পেমেন্ট',
      loading_fee: 'লোডিং ফি',
      engine_repair: 'ইঞ্জিন মেরামত',
      other: 'অন্যান্য',
    },
  },
  misc: {
    noData: '—',
    pageOf: 'পৃষ্ঠা {page} / {total}',
    confidential: 'গোপনীয় — শুধুমাত্র অভ্যন্তরীণ ব্যবহারের জন্য',
  },
};

export const PDF_STRINGS: Record<AppLocale, PdfStrings> = {
  en: EN,
  bn: BN,
};

/** Returns the human-readable expense category label for the given locale. */
export function getExpenseCategoryLabel(
  category: string,
  strings: PdfStrings
): string {
  return (
    strings.expenses.categories[category as keyof PdfStrings['expenses']['categories']] ??
    category
  );
}


