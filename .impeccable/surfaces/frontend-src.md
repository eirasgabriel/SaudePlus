---
version: 1
slug: "frontend-src"
primary_target: "frontend/src"
related_targets: []
---

Scope: entire frontend UI (public site in Persuade mode; auth, paciente, médico and admin panels in Operate mode). Code-led. Palette pinned by user (PRODUCT.md Brand Commitments).

Audience/job: patients book and follow care; doctors run their day; clinic staff administer. Constraint: no changes to routes, data, factual copy or behavior; JSX edits only where structure requires; frontend tests must keep passing.

## Direction contract

THESIS: SaúdePlus is one modular building, not three dashboards: a Rede Sarah–style structure where a navy shell carries every area and white work surfaces hang inside it. Refuses the category default of floating white cards with soft shadows on pale blue.

OWN-WORLD: Navy #020F45/#041A58 shell (rails, headers, footers) like painted steel; white surfaces on the #F0F7FD ground; #0070E8 only for primary action, selection and links; cyan #44C6F4 only for focus and the active marker. One grid modulus (8px base, 4-col modules). Borders are hairlines, not shadows. One large "shed" radius where the shell meets content; everything else small (6–10px). Atkinson Hyperlegible Next for all text, rank by weight and size on a tight scale, tabular figures for time and money.

STORY: Visitors understand within one viewport that they can find a professional and book; signed-in users see today's work first and the state of every item by shape and color.

FIRST VIEWPORT: Public home: navy shell header, hero with the search bar as the primary object at full width, the shed curve closing the hero into the content. Panels: navy left rail (brand, nav, account), page header with title and the guide line ("hoje · 7 consultas"), the primary list/table in the first white surface, primary action top right.

FORM: Rede Sarah (Lelé + Athos Bulcão) modular architecture, candidate 4 of 7 grounded list. seed:a9b45c7a36f982ac. Signature move: status tiles: geometric disc glyphs that fill with progress (pendente ◔, confirmada ◑, aguardando/em andamento ◕, realizada ●, cancelada/faltou struck ⊘) paired with color and text. Raises: cancelled items remain visible and struck (ticket wallet); list guide headers naming the span in view (lexicon); compact hairline density in admin tables (Japanese high-density); color reserved for state and action (Ikeda).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
