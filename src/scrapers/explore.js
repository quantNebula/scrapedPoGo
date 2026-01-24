const jsd = require('jsdom');
const { JSDOM } = jsd;

async function exploreEventsPage() {
  const dom = await JSDOM.fromURL('https://leekduck.com/events/');
  const doc = dom.window.document;
  const firstEvent = doc.querySelector('div.events-list.current-events a.event-item-link, div.events-list.upcoming-events a.event-item-link');
  if (!firstEvent) {
    console.log('[events] No event items found.');
    return;
  }

  const eventText = firstEvent.querySelector('.event-text')?.textContent?.trim() || '';
  const eventDate = firstEvent.querySelector('.event-date')?.textContent?.trim() || '';
  const eventMeta = firstEvent.querySelector('.event-meta')?.textContent?.trim() || '';
  const eventBadge = firstEvent.querySelector('.event-badge')?.textContent?.trim() || '';

  console.log('[events] sample event text:', JSON.stringify(eventText));
  console.log('[events] sample event date:', JSON.stringify(eventDate));
  console.log('[events] sample event meta:', JSON.stringify(eventMeta));
  console.log('[events] sample event badge:', JSON.stringify(eventBadge));

  const eventLink = firstEvent.href;
  console.log('[events] sample event link:', eventLink);

  // Inspect sections on the event detail page
  try {
    const detail = await JSDOM.fromURL(eventLink);
    const detailDoc = detail.window.document;
    const headers = Array.from(detailDoc.querySelectorAll('h2.event-section-header'))
      .map(h => ({ id: h.id || '', text: h.textContent.trim() }))
      .filter(h => h.text);
    console.log('[events] detail page section headers:', headers);
  } catch (err) {
    console.log('[events] detail page fetch failed:', err?.message || err);
  }
}

async function exploreResearchPage() {
  const dom = await JSDOM.fromURL('https://leekduck.com/research/');
  const doc = dom.window.document;

  const rewardTypes = new Map();
  doc.querySelectorAll('.reward-list > .reward').forEach(r => {
    const type = r.dataset.rewardType || 'unknown';
    const label = r.querySelector('.reward-label')?.textContent?.trim() || '';
    const amount = r.querySelector('.reward-amount')?.textContent?.trim() || '';
    if (!rewardTypes.has(type)) rewardTypes.set(type, new Set());
    rewardTypes.get(type).add(`${label}${amount ? ` (${amount})` : ''}`.trim());
  });

  const summary = Array.from(rewardTypes.entries()).map(([type, labels]) => ({
    type,
    examples: Array.from(labels).slice(0, 5)
  }));
  console.log('[research] reward types and examples:', summary);
}

async function exploreEggsPage() {
  const dom = await JSDOM.fromURL('https://leekduck.com/eggs/');
  const doc = dom.window.document;

  const firstCard = doc.querySelector('.egg-grid .pokemon-card');
  if (!firstCard) {
    console.log('[eggs] No egg cards found.');
    return;
  }

  const candy = firstCard.querySelector('.candy')?.textContent?.trim() || '';
  const candyIcon = firstCard.querySelector('.candy img')?.src || '';
  const stardust = firstCard.querySelector('.stardust')?.textContent?.trim() || '';
  const stardustIcon = firstCard.querySelector('.stardust img')?.src || '';

  console.log('[eggs] sample candy text:', JSON.stringify(candy));
  console.log('[eggs] sample candy icon:', candyIcon);
  console.log('[eggs] sample stardust text:', JSON.stringify(stardust));
  console.log('[eggs] sample stardust icon:', stardustIcon);
}

async function exploreRaidsPage() {
  const dom = await JSDOM.fromURL('https://leekduck.com/boss/');
  const doc = dom.window.document;

  const firstCard = doc.querySelector('.grid .card');
  if (!firstCard) {
    console.log('[raids] No raid boss cards found.');
    return;
  }

  const bossName = firstCard.querySelector('.identity .name')?.textContent?.trim() || '';
  const bossForm = firstCard.querySelector('.identity .form')?.textContent?.trim() || '';
  const bossGender = firstCard.querySelector('.identity .gender')?.textContent?.trim() || '';
  const bossMoves = Array.from(firstCard.querySelectorAll('.moves .move'))
    .map(m => m.textContent.trim())
    .filter(Boolean);

  console.log('[raids] sample boss name:', bossName);
  console.log('[raids] sample boss form:', bossForm);
  console.log('[raids] sample boss gender:', bossGender);
  console.log('[raids] sample boss moves:', bossMoves.slice(0, 6));
}

async function exploreRocketPage() {
  const dom = await JSDOM.fromURL('https://leekduck.com/rocket-lineups/');
  const doc = dom.window.document;

  const profile = doc.querySelector('.rocket-profile');
  if (!profile) {
    console.log('[rocket] No rocket profiles found.');
    return;
  }

  const rewards = Array.from(profile.querySelectorAll('.reward img'))
    .map(img => ({ alt: img.getAttribute('alt') || '', src: img.src }))
    .filter(r => r.alt || r.src);

  console.log('[rocket] sample rewards:', rewards.slice(0, 5));
}

async function main() {
  await exploreEventsPage();
  await exploreResearchPage();
  await exploreEggsPage();
  await exploreRaidsPage();
  await exploreRocketPage();
}

main().catch(err => {
  console.error('Explore error:', err);
  process.exit(1);
});
