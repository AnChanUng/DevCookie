# Reading themes

Added warm-gray and soft-charcoal as optional palettes; existing preferences remain unchanged.

Evidence reviewed 2026-11-04:
- https://pubmed.ncbi.nlm.nih.gov/17510822/ — proofreading favored positive polarity; fatigue measures did not differ. This is not proof that warm gray prevents eyestrain.
- https://pubmed.ncbi.nlm.nih.gov/28166901/ — brief reading performance depended on polarity and ambient illumination; task-specific results do not establish a universal best palette.
- https://pubmed.ncbi.nlm.nih.gov/36533999/ — individual/age and ambient context matter for dark-mode preference and workload.
- https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html — normal text 4.5:1 minimum, large text 3:1.

Design inference: optional off-white and charcoal backgrounds, restrained teal accents, readable secondary text, and code backgrounds close to the page luminance. Exact hex choices are design decisions, not clinically validated colors. CSS colors cannot control display brightness or ambient lighting.

Automated contrast checks cover theme text tokens on the three surfaces, syntax tokens on code background, and white text on primary gradient endpoints. They do not certify all hardcoded component colors or the whole website as WCAG compliant.
