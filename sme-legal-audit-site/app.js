const questionsData = [
  {
    id: 'domain1',
    title: 'Domain 1 — Labor & Employment',
    questions: [
      'Do you have written employment contracts for all employees?',
      'Are statutory benefits (SSS/PhilHealth/Pag-IBIG) paid and up to date?',
      'Do you follow the two-notice rule and keep discipline records?',
      'Is wage & hour computation (OT, night diff, holiday pay) documented?'
    ]
  },
  {
    id: 'domain2',
    title: 'Domain 2 — Contracts & Commercial',
    questions: [
      'Are client engagements covered by written contracts?',
      'Do your contracts define payment terms and remedies?',
      'Do you maintain supplier agreements with delivery & penalty terms?',
      'Do lease and property agreements protect your business continuity?'
    ]
  },
  {
    id: 'domain3',
    title: 'Domain 3 — Corporate Governance',
    questions: [
      'Is SEC/BIR/Local permits registration current and documented?',
      'Do you maintain minutes, board resolutions and stock records?',
      'Is beneficial ownership and shareholders agreement documented?',
      'Are financial statements consistent across filings and banks?'
    ]
  },
  {
    id: 'domain4',
    title: 'Domain 4 — Dispute & Collections',
    questions: [
      'Do you have a document retention and backup policy?',
      'Do contracts include dispute resolution clauses (mediation/arb)?',
      'Do you issue formal demand letters before pursuing court action?',
      'Is there a collections policy for overdue accounts?' 
    ]
  },
  {
    id: 'domain5',
    title: 'Domain 5 — Regulatory & Administrative',
    questions: [
      'Are all applicable taxes filed and paid on time?',
      'Are industry-specific licenses and permits current?',
      'Do you have a Data Privacy compliance program (DPA/NPC)?',
      'Are DOLE establishment reports and OSHS records maintained?'
    ]
  }
];

const answerWeights = { yes: 0, partial: 1, no: 2 };

function mountQuestions() {
  const container = document.getElementById('questions');
  container.innerHTML = '';
  questionsData.forEach(domain => {
    const card = document.createElement('div');
    card.className = 'card';
    const title = document.createElement('div');
    title.className = 'domain-title';
    title.textContent = domain.title;
    card.appendChild(title);

    domain.questions.forEach((q, idx) => {
      const qdiv = document.createElement('div');
      qdiv.className = 'question';
      const qid = `${domain.id}_q${idx}`;
      qdiv.innerHTML = `
        <label>${q}</label>
        <div class="options">
          <label><input type="radio" name="${qid}" value="yes"> Yes</label>
          <label><input type="radio" name="${qid}" value="partial"> Partial</label>
          <label><input type="radio" name="${qid}" value="no"> No</label>
        </div>
      `;
      card.appendChild(qdiv);
    });

    container.appendChild(card);
  });
}

function computeResults() {
  const results = [];
  let totalScore = 0;
  let totalItems = 0;

  questionsData.forEach(domain => {
    let domainScore = 0;
    let domainItems = domain.questions.length;
    domain.questions.forEach((_, idx) => {
      const qname = `${domain.id}_q${idx}`;
      const val = document.querySelector(`input[name="${qname}"]:checked`);
      const w = val ? answerWeights[val.value] : 2; // unanswered => high risk
      domainScore += w;
    });
    totalScore += domainScore;
    totalItems += domainItems * 2; // max per item = 2

    const avg = domainScore / (domainItems * 2); // 0..1
    const level = mapAvgToLevel(avg);
    results.push({ domain: domain.title, score: domainScore, max: domainItems*2, avg, level });
  });

  const overallAvg = totalScore / totalItems;
  const overallLevel = mapAvgToLevel(overallAvg);
  return { results, overall: { avg: overallAvg, level: overallLevel } };
}

function mapAvgToLevel(avg) {
  // avg between 0 (no risk) and 1 (highest)
  if (avg <= 0.24) return 'LOW';
  if (avg <= 0.59) return 'MODERATE';
  return 'HIGH';
}

function showResults(report) {
  document.getElementById('results').classList.remove('hidden');
  const dr = document.getElementById('domain-results');
  dr.innerHTML = '';
  report.results.forEach(r => {
    const el = document.createElement('div');
    el.className = `domain-result ${r.level.toLowerCase()}`;
    el.innerHTML = `<strong>${r.domain}</strong>
      <div>Risk level: <em>${r.level}</em></div>
      <div>Score: ${r.score} / ${r.max}</div>`;
    dr.appendChild(el);
  });

  const overall = document.getElementById('overall-result');
  overall.innerHTML = `<div class="card"><h3>Overall profile: ${report.overall.level}</h3>
    <p>Recommended next steps:</p>
    <ul>
      ${report.overall.level === 'HIGH' ? '<li>Immediate comprehensive legal audit required.</li>' : ''}
      ${report.overall.level === 'MODERATE' ? '<li>Structured correction plan within 60–90 days.</li>' : ''}
      ${report.overall.level === 'LOW' ? '<li>Maintain current practices and annual review.</li>' : ''}
      <li>Download or print this page for your records.</li>
    </ul></div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  mountQuestions();
  document.getElementById('calculate').addEventListener('click', () => {
    const report = computeResults();
    showResults(report);
  });
  document.getElementById('print').addEventListener('click', () => window.print());
});
