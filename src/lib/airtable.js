/**
 * Airtable data layer for Minimum Viable Expat
 * 
 * The math:
 *   Total = Rent + (food + utilities + transit + other) × Multiplier
 *   - Single: 1.0x
 *   - Couple: 1.7x (or city-specific)
 *   - Family: 2.5x (or city-specific)
 *   - Rent is NEVER multiplied
 */

const MULTIPLIERS = {
  single: 1.0,
  couple: 1.7,
  family: 2.5,
};

async function fetchAllRecords(baseId, tableName, apiKey) {
  const records = [];
  let offset = null;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    records.push(...data.records);
    offset = data.offset || null;
  } while (offset);

  return records;
}

function transformRecord(record) {
  const f = record.fields;

  const city = {
    id: f.ID || '',
    city: f.CITY || '',
    country: f.COUNTRY || '',
    region: f.REGION || '',

    rent1BR: Number(f.rent1BR) || 0,
    rent2BR: Number(f.rent2BR) || 0,
    rent3BR: Number(f.rent3BR) || 0,

    food: Number(f.food) || 0,
    utilities: Number(f.utilities) || 0,
    transit: Number(f.transit) || 0,
    other: Number(f.other) || 0,

    coupleMultiplier: Number(f.coupleMultiplier) || MULTIPLIERS.couple,
    familyMultiplier: Number(f.familyMultiplier) || MULTIPLIERS.family,

    narrative: f.cityNarrative || '',
    editorRank: Number(f.editorRank) || null,
  };

  city.costs = computeAllCosts(city);
  return city;
}

function computeCost(city, household, bedrooms) {
  const rentKeys = { '1BR': 'rent1BR', '2BR': 'rent2BR', '3BR': 'rent3BR' };
  const rent = city[rentKeys[bedrooms]];
  const variableBase = city.food + city.utilities + city.transit + city.other;

  let multiplier;
  if (household === 'single') multiplier = MULTIPLIERS.single;
  else if (household === 'couple') multiplier = city.coupleMultiplier;
  else multiplier = city.familyMultiplier;

  return {
    total: rent + Math.round(variableBase * multiplier),
    rent,
    food: Math.round(city.food * multiplier),
    utilities: Math.round(city.utilities * multiplier),
    transit: Math.round(city.transit * multiplier),
    other: Math.round(city.other * multiplier),
    multiplier,
    household,
    bedrooms,
  };
}

function computeAllCosts(city) {
  const scenarios = {};
  for (const h of ['single', 'couple', 'family']) {
    for (const b of ['1BR', '2BR', '3BR']) {
      scenarios[`${h}-${b}`] = computeCost(city, h, b);
    }
  }
  return scenarios;
}

export async function getAllCities() {
  const apiKey = import.meta.env.AIRTABLE_API_KEY;
  const baseId = import.meta.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error(
      'Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID. ' +
      'Add them to .env locally or GitHub Secrets for CI.'
    );
  }

  const records = await fetchAllRecords(baseId, 'Cities', apiKey);
  const cities = records.map(transformRecord).filter(c => c.id && c.city);

  cities.sort((a, b) => {
    if (a.editorRank && b.editorRank) return a.editorRank - b.editorRank;
    if (a.editorRank) return -1;
    if (b.editorRank) return 1;
    return a.city.localeCompare(b.city);
  });

  return cities;
}

export { computeCost, computeAllCosts, MULTIPLIERS };
