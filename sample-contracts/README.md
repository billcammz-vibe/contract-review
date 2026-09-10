# Test contracts

Run `npm run samples` from the project root to (re)generate two contrasting dummy
contracts here. They are fictional and exist only to exercise the analyzer.

| File | Format | Character |
|---|---|---|
| `cloudnimbus-saas-agreement.docx` | DOCX | **Vendor-favourable.** Written to trip most of the risk checks and playbook deviations. |
| `meridian-msa.pdf` | PDF (2 pages) | **Balanced.** Mutual, customer-reasonable terms that mostly satisfy the playbook. |

You can also drop your own `.pdf` / `.docx` files into this folder, or upload
anything directly from the app — files are processed in memory and never stored.

## Roughly what to expect

### `cloudnimbus-saas-agreement.docx`
- **High-severity risks:** one-sided liability cap (Provider capped at 3 months' fees, Customer uncapped), no Customer termination for convenience while Provider keeps one, Customer-only indemnification with no vendor IP indemnity.
- **Medium:** 3-year term with 2-year auto-renewal on 90 days' notice, foreign governing law and venue (Dublin, Ireland), one-way confidentiality lasting only 2 years, Net 15 with up to 10%/yr price increases, no assignment right for Customer.
- **Playbook:** mostly **DEVIATES** / **MISSING**; low score.

### `meridian-msa.pdf`
- **Few or no high-severity risks.**
- **Playbook:** mostly **MEETS** — mutual 12-month liability cap with narrow carve-outs, 30-day termination for convenience with pro-rata refund, 30-day cure period, mutual 3-year confidentiality (perpetual for trade secrets), vendor IP indemnity, Delaware law, assignment only with consent plus an affiliate / M&A exception.
- Use it to confirm the analyzer doesn't manufacture problems that aren't there.
