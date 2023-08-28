import { createInvoice } from "./pdfs.js";

const invoice = {
  shipping: {
    name: "John Doe",
    address: "1234 Main Street",
    city: "San Francisco",
    state: "CA",
    country: "US",
    postal_code: 94111,
  },
  items: [
    {
      item: "TC 100",
      description: "Toner Cartridge",
      quantity: 2,
      amount: 6000,
    },
    {
      item: "IPHONE",
      description: "USB Cable Extender",
      quantity: 8,
      amount: 2000,
    },
  ],
  subtotal: 8000,
  paid: 0,
  invoice_nr: 1234,
};

createInvoice(invoice, "invoice.pdf");
