const SPREADSHEET_ID = '17ffLkLnM63DQXV6j_st4aFvIgVAI816GVVGmnhpjRM8';
const SOURCE_TAB = 'All Roles Editable';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Tribe NWOB Structure | VMO Resource Management')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function clean(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function normalize(value) {
  return clean(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeRole(value) {
  return normalize(value).replace(/assurrance/g, 'assurance');
}

function parseAllocation(value) {
  if (value === '' || value === null || value === undefined || value === '-') {
    return 1;
  }
  const number = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(number) ? number : 1;
}

function getDashboardData() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SOURCE_TAB);

  if (!sheet) {
    throw new Error('Sheet not found: ' + SOURCE_TAB);
  }

  const rawRows = [];
  const tribeSet = new Set();
  const chapLeadSet = new Set();

  sheet.getDataRange().getValues().slice(1).forEach(row => {
    const tribe = clean(row[1]);
    const pod = clean(row[3]);
    const resource = clean(row[5]);
    const allocation = parseAllocation(row[6]);
    const roleH = clean(row[7]);
    const roleL = clean(row[11]);
    const categoryQ = clean(row[16]);
    const aeChapLeadR = clean(row[17]);
    
    // Organizational Roles
    const tribeLead = clean(row[18]);
    const smChapLead = clean(row[19]);
    const sdChapLead = clean(row[20]);
    const qaChapLead = clean(row[21]);
    const portfolioManager = clean(row[22]);
    const agileCoach = clean(row[23]);
    const platformManager = clean(row[24]);
    const platformEngineer = clean(row[25]);
    const deliveryChangeAnalyst = clean(row[26]);
    const deliveryChangeManager = clean(row[27]);

    const normRoleL = normalizeRole(roleL);
    const isBau = normalize(categoryQ) === 'bau';

    if ((normRoleL === 'others' || normRoleL === 'other') && !isBau) return;

    if (tribe) tribeSet.add(tribe);
    if (aeChapLeadR) chapLeadSet.add(aeChapLeadR);

    if (pod || resource) {
      rawRows.push({
        tribe,
        pod,
        resource,
        allocation,
        roleH,
        roleL,
        categoryQ,
        aeChapLeadR,
        tribeLead,
        smChapLead,
        sdChapLead,
        qaChapLead,
        portfolioManager,
        agileCoach,
        platformManager,
        platformEngineer,
        deliveryChangeAnalyst,
        deliveryChangeManager
      });
    }
  });

  return {
    metadata: {
      title: 'POD Resource Governance Dashboard',
      description: 'Resource and POD assignment view.',
      generated_at: new Date().toISOString(),
      source_title: 'AIPODS Source File - Final',
      source_url: 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID,
      source_tab: SOURCE_TAB
    },
    tribes: Array.from(tribeSet).sort((a, b) => a.localeCompare(b)),
    aeChapLeads: Array.from(chapLeadSet).sort((a, b) => a.localeCompare(b)),
    rawRows: rawRows
  };
}
