# RelayTop NG frontend design system

## Brand foundation

**Product name:** RelayTop NG. The name communicates the job of the service: reliably relaying gaming credit to a player's account. Use `RelayTop` in the product UI and `RelayTop NG` in legal, regional, and support contexts.

**Tagline:** *Gaming credit, relayed fast.*

**Logo direction:** a compact, forward-leaning relay bolt inside a softened square. The bolt represents speed; the rounded container keeps the mark welcoming and trustworthy. Use the teal-to-sky gradient mark at small sizes, never a publisher logo or game character. The current product mark is implemented by `.brand-mark` in `src/index.css` and the `Zap` icon in `Header`.

**Personality:** calm, capable, direct, and reassuring. It should feel like a dependable payments product for players, not an aggressive esports team. Prefer plain language: “Verify account”, “Total due”, “Delivery in progress”. Do not promise “official” supply or use publisher marks unless the relationship and artwork licence have been confirmed.

## Core tokens

The source of truth is `src/index.css`. These CSS custom properties are available to both storefront and admin screens.

| Purpose | Token | Value |
| --- | --- | --- |
| Canvas / neutral | `--color-canvas` | `#08111f` |
| Raised surface | `--color-surface-raised` | `#16243a` |
| Border / neutral | `--color-border` | `#29405e` |
| Main text / neutral | `--color-text` | `#f5f8fc` |
| Muted text / neutral | `--color-text-muted` | `#9db0c9` |
| Primary accent | `--color-primary` | `#20d6a6` |
| Danger | `--color-danger` | `#ff6b7a` |
| Success | `--color-success` | `#20d6a6` |
| Warning | `--color-warning` | `#ffc65a` |

### Typography

Use `--font-display` (`Trebuchet MS`, `Avenir Next`, Avenir, `Segoe UI`, sans-serif) for the wordmark and large editorial headings only. Use `--font-body` (Inter, system UI fallbacks) for all controls, UI, and body copy. Use `--font-mono` for IDs, references, and values that users copy. These local/system stacks load without a third-party font dependency and preserve readable fallbacks.

### Layout, shape, and elevation

Use the 4px-derived `--space-1` through `--space-8` scale. Standard control radius is `--radius-md` (12px), primary button radius is `--radius-lg` (16px), and sections/cards use `--radius-xl` (24px). Use `--shadow-card` for static raised sections and `--shadow-float` only for modals, menus, and the support action.

## Component recipes

| Component | Recipe |
| --- | --- |
| Primary button | `.ds-button-primary`; 48px minimum target height; bold dark ink; disabled state must lower opacity and block pointer action. |
| Secondary button | raised surface, `--color-border`, white text; on hover brighten surface, never change meaning to success. |
| Input | `.ds-input`; 44px minimum height; visible label; focus ring uses `--color-focus`; helper/error text follows the input. |
| Card | `.ds-card`; one surface, border, 24px radius, card shadow. Avoid nested heavy shadows. |
| Badge | 10–12px bold text, pill radius; always pair the colour with a short label such as “Verified” or “Pending”. |
| Status | Success uses `--color-success`, danger uses `--color-danger`, processing uses a cyan/blue informational treatment, pending uses `--color-warning`. Include icon/text so colour is never the only signal. |

## Accessibility and consistency rules

- Keep foreground/background combinations at WCAG AA contrast or better. The primary colour is for emphasis on dark surfaces; primary buttons use `--color-primary-ink` for legibility.
- Do not remove the global `:focus-visible` indicator. Keyboard focus must remain apparent on every interactive element.
- Keep touch targets at least 44px in either dimension. Use semantic buttons for actions and labels for every input.
- New screen work must use these semantic tokens or recipes first. Add a token here and in `src/index.css` before adding a one-off colour, shadow, or radius.

## Game-category artwork policy

`public/assets/game-art/` contains original, abstract category artwork created for RelayTop NG. It deliberately contains no game characters, publisher logos, or screenshots, and can be used as a safe category background. `bannerUrl` values in `src/data/initialCatalog.ts` point only to these local assets; generic third-party banner photography has been removed.

If publisher-approved artwork is later supplied, store the approval/licence record with the asset, credit it where required, and replace the matching local category art only after approval. Never use search-result images, publisher key art, or game screenshots by default.
