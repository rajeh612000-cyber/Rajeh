// Copy + SEO metadata for the three solution pages and the /solutions/ hub.
// Capability claims are drafted from the live site (homepage cards, the
// Strategic Acceleration page this replaces): have the product team confirm
// each one before publishing. No results, statistics or testimonials are
// invented; the scenario table reuses the homepage's own illustrative R1.

export const SITE = {
  origin: 'https://smartvalueaisolutions.com',
  brand: 'Smart Value',
  legalName: 'Smart Value AI Solutions',
  contact: '/contact-us/',
  // URL base for the new pages. '/solutions/' gives /solutions/price-optimizer/
  // (needs a published "Solutions" parent page). Set to '/' for flat URLs.
  base: '/solutions/',
  hub: { name: 'Solutions', path: '/solutions/' }, // set to null when base is '/'
  // Pages that stay live under the new "Platform" menu item.
  platform: [
    { name: 'Commercial Analytics', icon: 'chart', path: '/commercial-analytics/', tag: 'See what is happening',
      text: 'Find out where your commercial growth is coming from, starting with the E-POS or sales audit data you already have.' },
    { name: 'AI Decision Support (SmartBot)', icon: 'chat', path: '/ai-decision-support-smart-bot/', tag: 'Act faster across teams',
      text: 'Ask commercial questions in plain language and get structured, action-ready answers grounded in your data.' },
  ],
};

export const ICONS = {
  // dollar, wallet, layout and bulb are the homepage card icons
  dollar: '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  layout: '<rect x="2.5" y="3" width="19" height="18" rx="2"/><path d="M2.5 9h19"/><path d="M9 9v12"/><path d="M5.5 12h1.5M5.5 15h1.5M12 12h6M12 15h4"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 21.5h4"/><path d="M12 2a6.5 6.5 0 0 0-3.7 11.8c.5.4.8 1 .8 1.6v.6h5.8v-.6c0-.6.3-1.2.8-1.6A6.5 6.5 0 0 0 12 2z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  alert: '<path d="M12 3l9.5 17h-19L12 3z"/><path d="M12 10v4.5M12 17.5h0"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v2.5a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0A2.7 2.7 0 0 1 4 11.5V9z"/><path d="M5.5 13.5V20h13v-6.5"/>',
  repeat: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  scale: '<path d="M12 3v18M5 21h14M4 7h16"/><path d="M4 7l-2.5 6a3 3 0 0 0 5 0L4 7zM20 7l-2.5 6a3 3 0 0 0 5 0L20 7z"/>',
};

export const PAGES = [
  {
    key: 'price-optimizer',
    slug: 'price-optimizer',
    scene: 'price',
    name: 'Price Optimizer',
    num: '01',
    icon: 'dollar',
    card: 'Find the price that improves revenue and margin while protecting volume.',
    seoTitle: 'Price Optimizer: Price Elasticity Analytics | Smart Value',
    metaDescription: 'Price Optimizer helps FMCG brands find the price that improves revenue and margin while protecting volume, by SKU, retailer and channel.',
    focusKeyword: 'price optimization software',
    eyebrow: 'Price Optimizer',
    h1: 'Find the price that grows revenue and margin <span class="svp-hl">without losing volume</span>',
    lede: 'Price Optimizer measures how shoppers respond to price for every SKU, retailer and channel in your FMCG portfolio, then shows you the price point that meets your revenue, margin and volume goals together.',
    primaryCta: 'Book a Price Optimizer walkthrough',
    legend: [['lilac', 'Revenue response across price points'], ['accent', 'Recommended price point']],
    visualLabel: 'Animated 3D landscape of revenue across price points, with a marker on the optimal price',
    problem: {
      h2: 'Most price decisions still start from last year’s list price',
      intro: 'A flat increase across the range is easy to agree on and expensive to get wrong.',
      items: [
        ['scale', 'Blanket increases', 'Every SKU gets the same percentage, even though some can carry more and others lose shoppers fast.'],
        ['alert', 'Unmeasured elasticity', 'Everyone knows price moves volume. Few teams know by how much for each pack size, retailer or channel.'],
        ['sliders', 'Margin vs. volume standoff', 'Finance pushes margin, sales defends volume, and no one can put the trade-off in numbers both sides accept.'],
      ],
    },
    answers: {
      h2: 'The pricing questions it answers',
      intro: 'Each answer is specific to a SKU, a retailer and a channel, not an average across the business.',
      items: [
        ['How sensitive is each SKU to price?', 'Elasticity estimates by SKU, pack size, retailer and channel, built from your own sales history.'],
        ['What happens if we move price by X%?', 'Simulate a change before it goes live and see the expected effect on volume, revenue and margin.'],
        ['Where is the price ceiling?', 'See the point where a higher price stops adding revenue and starts sending shoppers elsewhere.'],
        ['How should our pack-price ladder look?', 'Keep the gaps between pack sizes and tiers logical so shoppers trade up instead of trading out.'],
      ],
    },
    // Absorbs the intent of /strategic-acceleration/ (301 → this page), so the
    // redirect lands on a section that answers the same queries.
    scenario: {
      id: 'scenario-testing',
      h2: 'Scenario testing before you commit',
      intro: 'Compare price scenarios side by side and see the revenue, margin and volume trade-off of each, before a single shelf price changes.',
      rows: [
        ['R1', 'Targeted increase on core packs', '+4.2%', '+6.8%', '−0.6%', true],
        ['R2', 'Blanket +5% across the range', '+1.1%', '+3.9%', '−4.8%', false],
        ['R3', 'Hold price, deepen promotions', '+2.0%', '−1.5%', '+3.2%', false],
      ],
      note: 'Illustrative example, not client data.',
      points: [
        ['Trade-off analysis', 'Revenue, margin and volume side by side for every option, so the choice is explicit.'],
        ['Pack-price architecture', 'Test moves across pack sizes and price tiers together, not one SKU at a time.'],
        ['Retailer and channel view', 'See how the same move lands in each retailer and channel before you negotiate.'],
      ],
    },
    steps: [
      ['Connect your data', 'Sell-out, shipments, list and net prices, plus competitor prices where you have them.'],
      ['Model price response', 'Measure how volume reacts to price for every SKU, retailer and channel combination.'],
      ['Test scenarios', 'Compare price moves side by side against revenue, margin and volume targets.'],
      ['Decide and track', 'Take a recommended price per SKU into pricing talks, then track results against the forecast.'],
    ],
    audience: {
      h2: 'Built for the people who own the price',
      items: [
        ['Revenue growth management', 'One view of price, volume and margin across the portfolio.'],
        ['Pricing and commercial finance', 'Price moves that can be defended with numbers, before they go live.'],
        ['Key account managers', 'Retailer-specific evidence for list price and shelf price conversations.'],
      ],
      panelTitle: 'Use it on its own',
      panelText: 'Price Optimizer works as a standalone solution. No bundle, no full-suite commitment. Add Promotion Planner or Category Management later if you need them.',
    },
    faq: [
      ['What data does Price Optimizer need?', 'Sales history at SKU level (sell-out, shipments or both), list and net prices over time, and the retailers and channels you sell through. Competitor prices improve the model when you have them, but they are not required to get started.'],
      ['Can we use Price Optimizer without the other Smart Value™ solutions?', 'Yes. Each Smart Value™ solution is built, sold and used on its own. There is no bundle and no full-suite commitment.'],
      ['How is this different from a pricing spreadsheet?', 'A spreadsheet applies the assumptions you type into it. Price Optimizer estimates price response from your actual sales data, for each SKU, retailer and channel, and shows the revenue, margin and volume trade-off of every scenario.'],
      ['Does it account for differences between retailers and channels?', 'Yes. Shoppers respond to price differently by retailer and channel, so the recommendations are made at that level rather than as one national average.'],
      ['Who inside the business uses it?', 'Typically revenue growth management, pricing, commercial finance and key account teams. They use the same numbers, which makes pricing decisions faster to agree.'],
    ],
  },

  {
    key: 'promotion-planner',
    slug: 'promotion-planner',
    scene: 'promo',
    name: 'Promotion Planner',
    num: '02',
    icon: 'wallet',
    card: 'Identify which promotions drive incremental growth and better ROI.',
    seoTitle: 'Promotion Planner: Trade Promotion ROI | Smart Value',
    metaDescription: 'See which FMCG promotions drive incremental growth and better ROI. Promotion Planner separates true uplift from baseline sales, event by event.',
    focusKeyword: 'trade promotion optimization',
    eyebrow: 'Promotion Planner',
    h1: 'Know which promotions <span class="svp-hl">actually pay back</span>',
    lede: 'Promotion Planner separates incremental sales from what you would have sold anyway, so FMCG teams can see the real ROI of every mechanic, depth and retailer, and build the next calendar on evidence.',
    primaryCta: 'Book a Promotion Planner walkthrough',
    legend: [['lilac', 'Baseline sales'], ['primary', 'Incremental uplift'], ['accent', 'Best-ROI promotion']],
    visualLabel: 'Animated 3D bar chart of weekly sales across promotions, separating baseline from incremental uplift',
    problem: {
      h2: 'A volume spike is not the same as growth',
      intro: 'Promotions look good on a weekly sales chart. The question is how much of that volume you paid for twice.',
      items: [
        ['repeat', 'Subsidised baseline', 'Part of every promo spike would have sold at full price. Without a baseline, you can’t see how much.'],
        ['calendar', 'Calendars on repeat', 'Next year’s plan is often last year’s plan, because no one can show which events earned their place.'],
        ['alert', 'Hidden after-effects', 'Shoppers stock up during the deal and buy less afterwards. The dip rarely makes it into the ROI.'],
      ],
    },
    answers: {
      h2: 'The promotion questions it answers',
      intro: 'Scored event by event, so you can keep what works and cut what doesn’t.',
      items: [
        ['Which promotions created incremental volume?', 'Baseline and uplift are separated for every event, so you see growth, not just volume.'],
        ['What is the ROI of each mechanic and depth?', 'Compare price cuts, multibuys and features on incremental margin per unit of trade spend.'],
        ['What happens after the promotion ends?', 'Post-promotion dips and pull-forward are measured and netted off the result.'],
        ['What should next quarter’s calendar look like?', 'Simulate a calendar before committing budget and see the expected return by retailer.'],
      ],
    },
    steps: [
      ['Connect promo history', 'Past events, mechanics, depths, timings and the trade spend behind them.'],
      ['Measure the baseline', 'Estimate what each SKU would have sold without the promotion.'],
      ['Score every event', 'Incremental volume, margin and ROI for each promotion, net of after-effects.'],
      ['Plan the calendar', 'Keep the winners, fix or drop the rest, and test the new plan before it runs.'],
    ],
    audience: {
      h2: 'Built for the teams who spend the trade budget',
      items: [
        ['Trade marketing and RGM', 'Event-level evidence of what grew the business and what only moved volume.'],
        ['Key account managers', 'A stronger case in joint business planning with each retailer.'],
        ['Commercial finance', 'Trade spend measured on return, not only on volume.'],
      ],
      panelTitle: 'Use it on its own',
      panelText: 'Promotion Planner works as a standalone solution. No bundle, no full-suite commitment. Pair it with Price Optimizer later so everyday price and promo price are set together.',
    },
    faq: [
      ['What does "incremental" mean in Promotion Planner?', 'Incremental sales are the extra units a promotion created on top of the baseline, which is what the SKU would have sold at that time without the promotion. Promotion Planner reports ROI on incremental sales only.'],
      ['What data do we need to get started?', 'Weekly sales by SKU and retailer, a history of past promotions (mechanic, depth, dates) and the trade spend attached to them.'],
      ['Can we use Promotion Planner without the other Smart Value™ solutions?', 'Yes. Each Smart Value™ solution is built, sold and used on its own. There is no bundle and no full-suite commitment.'],
      ['Does it account for the dip after a promotion?', 'Yes. Shoppers often stock up during a deal and buy less afterwards. That post-promotion dip is measured and deducted before ROI is calculated.'],
      ['Can it help with retailer negotiations?', 'Yes. Event-level results by retailer give key account teams evidence to agree which promotions to repeat, change or stop in joint business plans.'],
    ],
  },

  {
    key: 'category-management',
    slug: 'category-management',
    scene: 'category',
    name: 'Category Management',
    num: '03',
    icon: 'layout',
    card: 'Build the range by retailer and channel, and know which SKUs earn their space.',
    seoTitle: 'Category Management: SKU & Range Analytics | Smart Value',
    metaDescription: 'Build the FMCG range by retailer and channel and know which SKUs earn their space. Category Management scores every SKU on sales, margin and incrementality.',
    focusKeyword: 'assortment optimization',
    eyebrow: 'Category Management',
    h1: 'Build the range that <span class="svp-hl">earns its shelf space</span>',
    lede: 'Category Management shows which SKUs grow the category, which ones only take sales from their neighbours, and what the right FMCG range looks like for each retailer and channel.',
    primaryCta: 'Book a Category Management walkthrough',
    legend: [['primary', 'SKUs that earn their space'], ['pale', 'Low performers'], ['accent', 'New listing']],
    visualLabel: 'Animated 3D shelf where SKUs are scored, low performers are removed and a new listing takes their place',
    problem: {
      h2: 'Every SKU on the shelf is taking space from another one',
      intro: 'Ranges grow one listing at a time. Few are reviewed with the same rigour on the way out.',
      items: [
        ['layers', 'Long tail, short shelf', 'Slow sellers hold facings that could go to SKUs shoppers actually look for.'],
        ['store', 'One range everywhere', 'The same range goes into every retailer and channel, even though shoppers differ between them.'],
        ['alert', 'Delisting on instinct', 'Without knowing where a SKU’s sales would go, cutting it feels risky, so nothing gets cut.'],
      ],
    },
    answers: {
      h2: 'The range questions it answers',
      intro: 'Per SKU, per retailer, per channel.',
      items: [
        ['Which SKUs earn their space?', 'Every SKU scored on sales, margin and contribution to the category, not on volume alone.'],
        ['Which SKUs are truly incremental?', 'See how much of a SKU’s volume would move to others in the range if it were delisted.'],
        ['What should the range be for each retailer?', 'Range recommendations built for each retailer’s and channel’s shoppers.'],
        ['How do we make the case to the retailer?', 'A category story backed by data, ready for range reviews and joint business planning.'],
      ],
    },
    steps: [
      ['Connect range data', 'Sales, margin and distribution by SKU, retailer and channel.'],
      ['Score every SKU', 'Rank each listing on its contribution to the category, not only its own volume.'],
      ['Model range changes', 'Estimate where volume goes if a SKU is delisted or a new one is added.'],
      ['Recommend the range', 'A range per retailer and channel, with the evidence to take into range reviews.'],
    ],
    audience: {
      h2: 'Built for the people who own the shelf',
      items: [
        ['Category managers', 'A clear, defendable view of which SKUs earn their space.'],
        ['Key account managers', 'Retailer-specific range proposals backed by data.'],
        ['Brand and portfolio teams', 'Evidence for which SKUs to grow, fix or retire.'],
      ],
      panelTitle: 'Use it on its own',
      panelText: 'Category Management works as a standalone solution. No bundle, no full-suite commitment. Add Price Optimizer later to price the range you keep.',
    },
    faq: [
      ['What does "a SKU earns its space" mean?', 'A SKU earns its space when it adds sales and margin to the category that would not simply move to another SKU if it were removed. Category Management measures that contribution for each SKU.'],
      ['Can the range differ by retailer and channel?', 'Yes. Recommendations are made for each retailer and channel, because shoppers and their needs differ between them.'],
      ['Can we use Category Management without the other Smart Value™ solutions?', 'Yes. Each Smart Value™ solution is built, sold and used on its own. There is no bundle and no full-suite commitment.'],
      ['What data do we need?', 'SKU-level sales and margin by retailer and channel, plus distribution data. Shopper or panel data improves the analysis when available.'],
      ['Does it help with new product listings?', 'Yes. It estimates how much a new SKU would add to the category versus take from existing ones, which helps decide what deserves a slot. For launch decisions, see Innovation Launch.'],
    ],
  },
];

// The /solutions/ hub: the Solutions menu item, breadcrumb parent and the
// relevant home for anyone arriving from a broad "solutions" query.
export const HUB = {
  key: 'solutions',
  scene: 'hub',
  name: 'Solutions',
  seoTitle: 'Solutions for FMCG Pricing, Promotions & Range | Smart Value',
  metaDescription: 'Four standalone solutions for FMCG commercial teams: Price Optimizer, Promotion Planner, Category Management and Innovation Launch. Take one, or all four.',
  focusKeyword: 'FMCG revenue growth management solutions',
  eyebrow: 'Four standalone solutions',
  h1: 'Start with the decision your brand <span class="svp-hl">needs most</span>',
  lede: 'Each Smart Value™ solution is built, sold and used on its own, no bundle, no full-suite commitment. Start with the commercial decision that matters most right now: price, promotions, range or launch.',
  primaryCta: 'Find my starting point',
  legend: [['primary', 'Four standalone solutions'], ['accent', 'The decision in focus'], ['lilac', 'One shared data foundation']],
  visualLabel: 'Animated 3D diagram of four solutions connected to one shared data core',
  launch: { name: 'Innovation Launch', num: '04', icon: 'bulb', card: 'Test what to launch, at what price, and in which format, before you invest.', pill: 'Smarter Launches' },
  guide: {
    h2: 'Which solution should you start with?',
    intro: 'Start from the question your team is asking this quarter.',
    items: [
      ['What price should each SKU be at?', 'price-optimizer'],
      ['Which promotions are worth running again?', 'promotion-planner'],
      ['Which SKUs deserve the shelf, retailer by retailer?', 'category-management'],
      ['What should we launch next, and at what price?', 'launch'],
    ],
  },
  platform: { h2: 'One platform behind every solution', intro: 'The same data foundation and AI layer sit under all four solutions.' },
  faq: [
    ['Do we need to buy all four solutions?', 'No. Each Smart Value™ solution is built, sold and used on its own. You can start with the decision that matters most this quarter and add others later.'],
    ['What data do the solutions need?', 'SKU-level sales data by retailer and channel is the starting point, usually E-POS or sales audit data. Each solution adds what it needs on top, such as prices for Price Optimizer or promotion history for Promotion Planner.'],
    ['Who are the solutions built for?', 'FMCG commercial, revenue growth management (RGM), category and key account teams who make pricing, promotion, range and launch decisions.'],
    ['How does SmartBot fit in?', 'SmartBot is the AI decision support layer of the Smart Value™ platform. It answers commercial questions in plain language, grounded in the same data the solutions use.'],
  ],
};
