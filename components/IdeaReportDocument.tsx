import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'
import type { Idea } from '@/lib/sanity/types'
import { BUDGET_LABELS, DIFFICULTY_LABELS } from '@/lib/sanity/types'

// ── Portable Text → plain string ──────────────────────────────────────────────
function pt(blocks: unknown[] | undefined): string {
  if (!blocks) return ''
  return (blocks as { _type?: string; children?: { text?: string }[] }[])
    .filter(b => b._type === 'block')
    .map(b => (b.children ?? []).map(c => c.text ?? '').join(''))
    .filter(Boolean)
    .join('\n\n')
}

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  indigo:       '#4338CA',
  indigoDeep:   '#312E81',
  indigoLight:  '#EEF2FF',
  indigoPale:   '#C7D2FE',
  green:        '#16A34A',
  greenLight:   '#F0FDF4',
  greenPale:    '#BBF7D0',
  amber:        '#D97706',
  amberLight:   '#FFFBEB',
  amberPale:    '#FDE68A',
  red:          '#DC2626',
  redLight:     '#FEF2F2',
  redPale:      '#FECACA',
  slate900:     '#0F172A',
  slate800:     '#1E293B',
  slate600:     '#475569',
  slate400:     '#94A3B8',
  slate200:     '#E2E8F0',
  slate100:     '#F1F5F9',
  slate50:      '#F8FAFC',
  white:        '#FFFFFF',
}

const SEV_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  High:   { bg: C.redLight,   text: C.red,   dot: C.red },
  Medium: { bg: C.amberLight, text: C.amber, dot: C.amber },
  Low:    { bg: C.greenLight, text: C.green, dot: C.green },
}

const KPI_COLOR: Record<string, { bg: string; label: string }> = {
  Revenue:    { bg: C.greenLight,  label: C.green },
  Customer:   { bg: C.indigoLight, label: C.indigo },
  Operations: { bg: C.amberLight,  label: C.amber },
  Marketing:  { bg: '#FFF7ED',     label: '#EA580C' },
  Finance:    { bg: '#F0F9FF',     label: '#0284C7' },
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Pages
  coverPage:  { backgroundColor: C.indigoDeep, fontFamily: 'Helvetica' },
  bodyPage:   { backgroundColor: C.white, fontFamily: 'Helvetica', paddingBottom: 44 },

  // Cover
  coverTop:         { padding: 44, paddingBottom: 0, flex: 1 },
  coverSiteLabel:   { fontSize: 8, color: C.indigoPale, letterSpacing: 3, marginBottom: 40 },
  coverEyebrow:     { fontSize: 9, color: C.indigoPale, letterSpacing: 2, marginBottom: 12, fontFamily: 'Helvetica-Bold' },
  coverTitle:       { fontFamily: 'Helvetica-Bold', fontSize: 28, color: C.white, lineHeight: 1.25, marginBottom: 16 },
  coverDesc:        { fontSize: 11, color: '#C7D2FE', lineHeight: 1.6, maxWidth: 420 },
  coverBadgeRow:    { flexDirection: 'row', gap: 8, marginTop: 24 },
  coverBadge:       { backgroundColor: '#3730A3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99,
                      fontSize: 8, color: C.indigoPale, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  coverBottom:      { backgroundColor: '#1E1B4B', padding: 44, paddingTop: 28, paddingBottom: 28,
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  coverBottomLabel: { fontSize: 8, color: '#6366F1', marginBottom: 4 },
  coverBottomVal:   { fontSize: 10, color: C.indigoPale, fontFamily: 'Helvetica-Bold' },
  coverBottomRight: { fontSize: 8, color: '#6366F1', textAlign: 'right' },
  coverDivider:     { height: 1, backgroundColor: '#3730A3', marginHorizontal: 44, marginTop: 0 },

  // Page header band
  pageHeader:       { backgroundColor: C.indigo, paddingHorizontal: 40, paddingVertical: 14,
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageHeaderTitle:  { fontSize: 10, color: C.white, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  pageHeaderSite:   { fontSize: 8, color: C.indigoPale },

  // Body
  body:             { paddingHorizontal: 40, paddingTop: 24 },

  // Section
  sectionLabel:     { fontSize: 7, fontFamily: 'Helvetica-Bold', letterSpacing: 2, color: C.indigo,
                      textTransform: 'uppercase', marginBottom: 10, marginTop: 20 },
  sectionDivider:   { height: 1, backgroundColor: C.slate200, marginBottom: 12 },

  // Stat cards grid
  statGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard:         { width: '31%', borderRadius: 8, padding: 10 },
  statDot:          { width: 6, height: 6, borderRadius: 99, marginBottom: 8 },
  statLabel:        { fontSize: 7, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  statValue:        { fontSize: 11, fontFamily: 'Helvetica-Bold' },

  // Demand box
  demandBox:        { backgroundColor: C.indigoLight, borderRadius: 8, padding: 12,
                      flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },
  demandBar:        { width: 3, borderRadius: 2, backgroundColor: C.indigo, alignSelf: 'stretch' },
  demandLabel:      { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.indigo, letterSpacing: 1,
                      textTransform: 'uppercase', marginBottom: 2 },
  demandText:       { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.slate800 },

  // Step 1
  step1Box:         { backgroundColor: C.greenLight, borderRadius: 8, padding: 14,
                      flexDirection: 'row', gap: 12, marginTop: 14 },
  step1Circle:      { backgroundColor: C.green, borderRadius: 99, width: 24, height: 24,
                      alignItems: 'center', justifyContent: 'center' },
  step1Num:         { color: C.white, fontFamily: 'Helvetica-Bold', fontSize: 12 },
  step1Label:       { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.green, letterSpacing: 1,
                      textTransform: 'uppercase', marginBottom: 3 },
  step1Text:        { fontSize: 10, color: C.slate800, lineHeight: 1.5, flex: 1 },

  // Projection table
  tableHeader:      { flexDirection: 'row', backgroundColor: C.slate900, borderRadius: 6,
                      paddingHorizontal: 12, paddingVertical: 8, marginBottom: 1 },
  tableHeaderCell:  { fontSize: 8, color: C.slate200, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  tableRow:         { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 9,
                      borderBottomWidth: 1, borderBottomColor: C.slate100 },
  tableRowAlt:      { backgroundColor: C.slate50 },
  tableCell:        { fontSize: 9, color: C.slate600 },
  tableCellBold:    { fontSize: 9, color: C.slate800, fontFamily: 'Helvetica-Bold' },

  // KPI grid
  kpiGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpiCard:          { width: '47%', borderRadius: 8, padding: 12 },
  kpiCat:           { fontSize: 7, fontFamily: 'Helvetica-Bold', letterSpacing: 1,
                      textTransform: 'uppercase', marginBottom: 4 },
  kpiMetric:        { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.slate900, marginBottom: 4 },
  kpiTarget:        { fontSize: 9, color: C.green, fontFamily: 'Helvetica-Bold' },
  kpiTimeframe:     { fontSize: 8, color: C.slate400, marginTop: 2 },

  // Risk table
  riskHeader:       { flexDirection: 'row', backgroundColor: C.slate900, borderRadius: 6,
                      paddingHorizontal: 12, paddingVertical: 8, marginBottom: 1 },
  riskRow:          { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
                      borderBottomWidth: 1, borderBottomColor: C.slate100, alignItems: 'flex-start' },
  riskRowAlt:       { backgroundColor: C.slate50 },
  riskSevBadge:     { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
                      fontSize: 7, fontFamily: 'Helvetica-Bold', alignSelf: 'flex-start' },
  riskTitle:        { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.slate800, marginBottom: 2 },
  riskImpact:       { fontSize: 8, color: C.slate600, lineHeight: 1.4 },
  riskMitigation:   { fontSize: 8, color: C.green, lineHeight: 1.4, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  riskMitigationLabel: { fontSize: 7, color: C.slate400, marginTop: 4, marginBottom: 1 },

  // Roadmap
  roadmapGrid:      { flexDirection: 'row', gap: 10 },
  roadmapCol:       { flex: 1 },
  roadmapHeader:    { borderRadius: 6, padding: 10, marginBottom: 8 },
  roadmapMonth:     { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  roadmapLabel:     { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.slate900 },
  roadmapItem:      { flexDirection: 'row', gap: 6, marginBottom: 7 },
  roadmapDot:       { width: 6, height: 6, borderRadius: 99, marginTop: 3, flexShrink: 0 },
  roadmapText:      { fontSize: 8.5, color: C.slate600, lineHeight: 1.45, flex: 1 },

  // Proof point
  proofCard:        { borderRadius: 8, padding: 11, marginBottom: 8 },
  proofBadge:       { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, fontSize: 7,
                      fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, alignSelf: 'flex-start', marginBottom: 6 },
  proofHeadline:    { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.slate900, marginBottom: 3, lineHeight: 1.3 },
  proofStat:        { fontSize: 9, color: C.slate600 },
  proofQuote:       { fontSize: 9, color: C.slate600, fontStyle: 'italic',
                      borderLeftWidth: 2, borderLeftColor: C.slate400, paddingLeft: 8, marginTop: 4 },
  proofSource:      { fontSize: 8, color: C.slate400, marginTop: 2 },

  // License chips row
  chipRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip:             { borderWidth: 1, borderColor: C.slate200, borderRadius: 99,
                      paddingHorizontal: 10, paddingVertical: 3,
                      flexDirection: 'row', gap: 4, alignItems: 'center' },
  chipTick:         { fontSize: 8, color: C.green },
  chipText:         { fontSize: 8, color: C.slate600 },

  // Pros/Cons
  prosConsRow:      { flexDirection: 'row', gap: 10 },
  prosBox:          { flex: 1, backgroundColor: C.greenLight, borderRadius: 8, padding: 12 },
  consBox:          { flex: 1, backgroundColor: C.redLight, borderRadius: 8, padding: 12 },
  prosLabel:        { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.green,
                      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  consLabel:        { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.red,
                      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  listItem:         { flexDirection: 'row', gap: 5, marginBottom: 5 },
  listBullet:       { fontSize: 9, width: 10, lineHeight: 1.5 },
  listText:         { fontSize: 8.5, color: C.slate600, lineHeight: 1.5, flex: 1 },

  // Footer
  footer:           { position: 'absolute', bottom: 16, left: 40, right: 40,
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      borderTopWidth: 1, borderTopColor: C.slate100, paddingTop: 8 },
  footerLeft:       { fontSize: 7, color: C.slate400 },
  footerRight:      { fontSize: 7, color: C.indigo },

  // Generic text
  para:             { fontSize: 9.5, color: C.slate600, lineHeight: 1.65, marginBottom: 6 },
  bold:             { fontFamily: 'Helvetica-Bold' },
})

// ── Helper components ─────────────────────────────────────────────────────────
function PageHeader({ title, ideaTitle }: { title: string; ideaTitle: string }) {
  return (
    <View style={s.pageHeader}>
      <Text style={s.pageHeaderTitle}>{title}</Text>
      <Text style={s.pageHeaderSite}>{ideaTitle} · BusinessIdeas.live</Text>
    </View>
  )
}

function Footer({ page, total }: { page: number; total: number }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerLeft}>BusinessIdeas.live · Business Launch Kit · Confidential</Text>
      <Text style={s.footerRight}>Page {page} of {total}</Text>
    </View>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View>
      <Text style={s.sectionLabel}>{children}</Text>
      <View style={s.sectionDivider} />
    </View>
  )
}

// ── Revenue projection table rows ─────────────────────────────────────────────
function projectionRows(monthly: string | undefined, breakeven: string | undefined, gross: string | undefined) {
  const phases = [
    { phase: 'Phase 1', period: 'Month 1–2',  label: 'Ramp-up',      pct: '20–35%' },
    { phase: 'Phase 2', period: 'Month 3–4',  label: 'Early Growth',  pct: '45–60%' },
    { phase: 'Phase 3', period: 'Month 5–8',  label: 'Steady State',  pct: '80–100%' },
    { phase: 'Phase 4', period: 'Month 9–12', label: 'Scaled',        pct: '110–150%' },
  ]
  return phases.map((p, i) => (
    <View key={p.phase} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
      <Text style={[s.tableCellBold, { flex: 1 }]}>{p.phase}</Text>
      <Text style={[s.tableCell, { flex: 1 }]}>{p.period}</Text>
      <Text style={[s.tableCell, { flex: 1.2 }]}>{p.label}</Text>
      <Text style={[s.tableCellBold, { flex: 1, color: C.green }]}>{p.pct} of target</Text>
      <Text style={[s.tableCell, { flex: 1.5, color: i < 2 ? C.amber : C.green }]}>
        {i === 0 ? 'Building customer base' : i === 1 ? `Near break-even (${breakeven || '4–6 mo'})` : i === 2 ? `${gross || '~60%'} gross margin` : 'Expansion phase'}
      </Text>
    </View>
  ))
}

// ── Main Document ─────────────────────────────────────────────────────────────
export default function IdeaReportDocument({ idea }: { idea: Idea }) {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const totalPages = 6

  const whyText   = pt(idea.why_it_works)
  const scopeText = pt(idea.scope_in_india)
  const targetText = pt(idea.target_audience)

  const hasFinancials = !!(idea.monthly_revenue_range || idea.breakeven_timeline || idea.setup_cost_range || idea.gross_margin)
  const hasRisks = !!(idea.risks_detailed?.length || idea.things_to_note?.length || idea.cons?.length)
  const hasRoadmap = !!(idea.execution_plan?.month_1?.length)

  return (
    <Document title={`${idea.title} — Business Launch Kit`} author="BusinessIdeas.live">

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 1 · COVER
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverTop}>
          <Text style={s.coverSiteLabel}>BUSINESSIDEAS.LIVE</Text>

          <Text style={s.coverEyebrow}>BUSINESS LAUNCH KIT</Text>
          <Text style={s.coverTitle}>{idea.title}</Text>
          <Text style={s.coverDesc}>{idea.description}</Text>

          <View style={s.coverBadgeRow}>
            {idea.industry && <Text style={s.coverBadge}>{idea.industry}</Text>}
            {idea.budget_range && <Text style={s.coverBadge}>{BUDGET_LABELS[idea.budget_range] || idea.budget_range}</Text>}
            {idea.difficulty_level && <Text style={s.coverBadge}>{DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}</Text>}
            {idea.market_saturation && <Text style={s.coverBadge}>{idea.market_saturation.toUpperCase()}</Text>}
          </View>
        </View>

        <View style={s.coverDivider} />

        <View style={s.coverBottom}>
          <View>
            <Text style={s.coverBottomLabel}>CONTENTS</Text>
            <Text style={s.coverBottomVal}>Executive Summary · Financials · KPIs</Text>
            <Text style={s.coverBottomVal}>Risk Register · 90-Day Roadmap · Proof</Text>
          </View>
          <View>
            <Text style={s.coverBottomRight}>Generated {today}</Text>
            <Text style={s.coverBottomRight}>businessideas.live</Text>
          </View>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 2 · EXECUTIVE SUMMARY
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.bodyPage}>
        <PageHeader title="EXECUTIVE SUMMARY" ideaTitle={idea.title} />
        <View style={s.body}>

          {/* Opportunity snapshot */}
          <SectionLabel>OPPORTUNITY SNAPSHOT</SectionLabel>
          {targetText ? <Text style={s.para}>{targetText}</Text> : null}
          {whyText ? <Text style={s.para}>{whyText}</Text> : null}
          {!targetText && !whyText && <Text style={s.para}>{idea.description}</Text>}

          {/* Demand signal */}
          {idea.demand_signal && (
            <View style={s.demandBox}>
              <View style={s.demandBar} />
              <View style={{ flex: 1 }}>
                <Text style={s.demandLabel}>Market Demand Signal</Text>
                <Text style={s.demandText}>{idea.demand_signal}</Text>
              </View>
            </View>
          )}

          {/* At-a-glance stat cards */}
          {hasFinancials && (
            <View style={{ marginTop: 18 }}>
              <SectionLabel>AT A GLANCE</SectionLabel>
              <View style={s.statGrid}>
                {idea.monthly_revenue_range && (
                  <View style={[s.statCard, { backgroundColor: C.greenLight }]}>
                    <View style={[s.statDot, { backgroundColor: C.green }]} />
                    <Text style={[s.statLabel, { color: C.green }]}>Monthly Revenue</Text>
                    <Text style={[s.statValue, { color: C.green }]}>{idea.monthly_revenue_range}</Text>
                  </View>
                )}
                {idea.time_to_first_revenue && (
                  <View style={[s.statCard, { backgroundColor: C.indigoLight }]}>
                    <View style={[s.statDot, { backgroundColor: C.indigo }]} />
                    <Text style={[s.statLabel, { color: C.indigo }]}>Time to Revenue</Text>
                    <Text style={[s.statValue, { color: C.indigo }]}>{idea.time_to_first_revenue}</Text>
                  </View>
                )}
                {idea.breakeven_timeline && (
                  <View style={[s.statCard, { backgroundColor: C.amberLight }]}>
                    <View style={[s.statDot, { backgroundColor: C.amber }]} />
                    <Text style={[s.statLabel, { color: C.amber }]}>Break-even</Text>
                    <Text style={[s.statValue, { color: C.amber }]}>{idea.breakeven_timeline}</Text>
                  </View>
                )}
                {idea.setup_cost_range && (
                  <View style={[s.statCard, { backgroundColor: C.slate100 }]}>
                    <View style={[s.statDot, { backgroundColor: C.slate400 }]} />
                    <Text style={[s.statLabel, { color: C.slate600 }]}>Setup Cost</Text>
                    <Text style={[s.statValue, { color: C.slate800 }]}>{idea.setup_cost_range}</Text>
                  </View>
                )}
                {idea.gross_margin && (
                  <View style={[s.statCard, { backgroundColor: C.indigoLight }]}>
                    <View style={[s.statDot, { backgroundColor: C.indigo }]} />
                    <Text style={[s.statLabel, { color: C.indigo }]}>Gross Margin</Text>
                    <Text style={[s.statValue, { color: C.indigo }]}>{idea.gross_margin}</Text>
                  </View>
                )}
                {idea.difficulty_level && (
                  <View style={[s.statCard, { backgroundColor: C.slate100 }]}>
                    <View style={[s.statDot, { backgroundColor: C.slate400 }]} />
                    <Text style={[s.statLabel, { color: C.slate400 }]}>Complexity</Text>
                    <Text style={[s.statValue, { color: C.slate800 }]}>{DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Pros & Cons */}
          {((idea.pros?.length) || (idea.cons?.length)) && (
            <View style={{ marginTop: 18 }}>
              <SectionLabel>STRENGTHS &amp; CHALLENGES</SectionLabel>
              <View style={s.prosConsRow}>
                {idea.pros?.length ? (
                  <View style={s.prosBox}>
                    <Text style={s.prosLabel}>Strengths</Text>
                    {idea.pros.map((item, i) => (
                      <View key={i} style={s.listItem}>
                        <Text style={[s.listBullet, { color: C.green }]}>✓</Text>
                        <Text style={s.listText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {idea.cons?.length ? (
                  <View style={s.consBox}>
                    <Text style={s.consLabel}>Challenges</Text>
                    {idea.cons.map((item, i) => (
                      <View key={i} style={s.listItem}>
                        <Text style={[s.listBullet, { color: C.red }]}>✕</Text>
                        <Text style={s.listText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          )}
        </View>
        <Footer page={2} total={totalPages} />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 3 · FINANCIAL PROJECTIONS & KPIs
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.bodyPage}>
        <PageHeader title="FINANCIAL PROJECTIONS & KPIs" ideaTitle={idea.title} />
        <View style={s.body}>

          {/* 12-Month Revenue Projection */}
          <SectionLabel>12-MONTH REVENUE TRAJECTORY</SectionLabel>
          <View>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderCell, { flex: 1 }]}>PHASE</Text>
              <Text style={[s.tableHeaderCell, { flex: 1 }]}>PERIOD</Text>
              <Text style={[s.tableHeaderCell, { flex: 1.2 }]}>STAGE</Text>
              <Text style={[s.tableHeaderCell, { flex: 1 }]}>VS TARGET</Text>
              <Text style={[s.tableHeaderCell, { flex: 1.5 }]}>KEY MILESTONE</Text>
            </View>
            {projectionRows(idea.monthly_revenue_range, idea.breakeven_timeline, idea.gross_margin)}
          </View>

          {idea.monthly_revenue_range && (
            <Text style={[s.para, { marginTop: 6, color: C.slate400 }]}>
              * Target = {idea.monthly_revenue_range}. Actual results depend on execution quality, local market conditions, and competition.
            </Text>
          )}

          {/* KPI Dashboard */}
          {idea.kpis && idea.kpis.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <SectionLabel>KPI DASHBOARD — WHAT TO TRACK</SectionLabel>
              <View style={s.kpiGrid}>
                {idea.kpis.map((kpi) => {
                  const col = KPI_COLOR[kpi.category] || KPI_COLOR.Revenue
                  return (
                    <View key={kpi._key} style={[s.kpiCard, { backgroundColor: col.bg }]}>
                      <Text style={[s.kpiCat, { color: col.label }]}>{kpi.category}</Text>
                      <Text style={s.kpiMetric}>{kpi.metric}</Text>
                      <Text style={s.kpiTarget}>Target: {kpi.target}</Text>
                      <Text style={s.kpiTimeframe}>{kpi.timeframe}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          )}

          {/* Scope in India */}
          {scopeText && (
            <View style={{ marginTop: 20 }}>
              <SectionLabel>MARKET SCOPE IN INDIA</SectionLabel>
              <Text style={s.para}>{scopeText}</Text>
            </View>
          )}

          {/* Financing */}
          {idea.financing_options && (
            <View style={{ marginTop: 16 }}>
              <SectionLabel>FINANCING OPTIONS</SectionLabel>
              <Text style={s.para}>{idea.financing_options}</Text>
            </View>
          )}
        </View>
        <Footer page={3} total={totalPages} />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 4 · RISK REGISTER
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.bodyPage}>
        <PageHeader title="RISK REGISTER" ideaTitle={idea.title} />
        <View style={s.body}>
          <SectionLabel>RISK ASSESSMENT MATRIX</SectionLabel>

          {idea.risks_detailed && idea.risks_detailed.length > 0 ? (
            <View>
              <View style={s.riskHeader}>
                <Text style={[s.tableHeaderCell, { flex: 0.7 }]}>SEVERITY</Text>
                <Text style={[s.tableHeaderCell, { flex: 1.6 }]}>RISK</Text>
                <Text style={[s.tableHeaderCell, { flex: 1.7 }]}>BUSINESS IMPACT</Text>
                <Text style={[s.tableHeaderCell, { flex: 2 }]}>MITIGATION STRATEGY</Text>
              </View>
              {idea.risks_detailed.map((r, i) => {
                const col = SEV_COLOR[r.severity] || SEV_COLOR.Medium
                return (
                  <View key={r._key} style={[s.riskRow, i % 2 === 1 ? s.riskRowAlt : {}]}>
                    <View style={{ flex: 0.7 }}>
                      <Text style={[s.riskSevBadge, { backgroundColor: col.bg, color: col.text }]}>
                        {r.severity}
                      </Text>
                    </View>
                    <View style={{ flex: 1.6 }}>
                      <Text style={s.riskTitle}>{r.title}</Text>
                    </View>
                    <View style={{ flex: 1.7 }}>
                      <Text style={s.riskImpact}>{r.impact}</Text>
                    </View>
                    <View style={{ flex: 2 }}>
                      <Text style={s.riskMitigation}>↳ {r.mitigation}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            /* Fallback: use things_to_note + cons as risk items */
            <View>
              {[...(idea.things_to_note || []), ...(idea.cons || [])].map((item, i) => (
                <View key={i} style={[s.riskRow, i % 2 === 1 ? s.riskRowAlt : {}]}>
                  <View style={{ flex: 0.7 }}>
                    <Text style={[s.riskSevBadge, { backgroundColor: i < 2 ? C.redLight : i < 4 ? C.amberLight : C.greenLight,
                      color: i < 2 ? C.red : i < 4 ? C.amber : C.green }]}>
                      {i < 2 ? 'High' : i < 4 ? 'Medium' : 'Low'}
                    </Text>
                  </View>
                  <View style={{ flex: 4 }}>
                    <Text style={s.riskTitle}>{item}</Text>
                    <Text style={s.riskMitigation}>↳ Monitor closely and build contingency plan</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Safe Growth Strategy */}
          <View style={{ marginTop: 24 }}>
            <SectionLabel>SAFE GROWTH PRINCIPLES</SectionLabel>
            {[
              { num: '01', title: 'Start Small, Validate Fast', text: 'Begin with a micro-version — 5 customers, one locality, minimal stock. Prove unit economics before scaling.' },
              { num: '02', title: 'Cash Flow First', text: 'Prioritise getting paid before delivering at scale. Collect advance payments wherever possible in the Indian market.' },
              { num: '03', title: 'Build One Anchor Customer', text: 'A single reliable, high-value client covers fixed costs. Acquire them before marketing broadly.' },
              { num: '04', title: 'Track Weekly, Not Monthly', text: 'Weekly revenue, customer count, and refund rate reviews let you course-correct before losses compound.' },
            ].map((item, i) => (
              <View key={i} style={[s.listItem, { marginBottom: 10, alignItems: 'flex-start' }]}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.indigo, width: 22 }}>{item.num}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.para, { fontFamily: 'Helvetica-Bold', color: C.slate900, marginBottom: 1 }]}>{item.title}</Text>
                  <Text style={s.para}>{item.text}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Pivot options */}
          {idea.pivot_options && (
            <View style={{ marginTop: 12 }}>
              <SectionLabel>PIVOT OPTIONS IF PRIMARY MODEL STRUGGLES</SectionLabel>
              <Text style={s.para}>{idea.pivot_options}</Text>
            </View>
          )}
        </View>
        <Footer page={4} total={totalPages} />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 5 · 90-DAY EXECUTION ROADMAP
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.bodyPage}>
        <PageHeader title="90-DAY EXECUTION ROADMAP" ideaTitle={idea.title} />
        <View style={s.body}>

          {/* Step 1 */}
          {idea.first_step && (
            <View style={s.step1Box}>
              <View style={s.step1Circle}>
                <Text style={s.step1Num}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.step1Label}>Start Here — This Week</Text>
                <Text style={s.step1Text}>{idea.first_step}</Text>
              </View>
            </View>
          )}

          {/* 3-column roadmap */}
          <SectionLabel>MONTH-BY-MONTH PLAN</SectionLabel>

          {hasRoadmap ? (
            <View style={s.roadmapGrid}>
              {[
                { month: 'MONTH 1', label: 'Foundation & Setup', color: C.indigo, bg: C.indigoLight, actions: idea.execution_plan!.month_1 },
                { month: 'MONTH 2', label: 'Launch & First Customers', color: C.green, bg: C.greenLight, actions: idea.execution_plan!.month_2 },
                { month: 'MONTH 3', label: 'Optimise & Scale', color: C.amber, bg: C.amberLight, actions: idea.execution_plan!.month_3 },
              ].map(col => (
                <View key={col.month} style={s.roadmapCol}>
                  <View style={[s.roadmapHeader, { backgroundColor: col.bg }]}>
                    <Text style={[s.roadmapMonth, { color: col.color }]}>{col.month}</Text>
                    <Text style={s.roadmapLabel}>{col.label}</Text>
                  </View>
                  {(col.actions || []).map((action, i) => (
                    <View key={i} style={s.roadmapItem}>
                      <View style={[s.roadmapDot, { backgroundColor: col.color }]} />
                      <Text style={s.roadmapText}>{action}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            /* Generic fallback roadmap */
            <View style={s.roadmapGrid}>
              {[
                { month: 'MONTH 1', label: 'Foundation & Setup', color: C.indigo, bg: C.indigoLight,
                  actions: ['Register business & get GST number', 'Source initial equipment/inventory', 'Set up basic online presence', 'Identify first 10 potential customers', 'Test pricing with 2–3 trial clients'] },
                { month: 'MONTH 2', label: 'Launch & First Customers', color: C.green, bg: C.greenLight,
                  actions: ['Begin active outreach and lead generation', 'Deliver for first 5 paying customers', 'Collect reviews and testimonials', 'Refine service/product based on feedback', 'Achieve first month of positive cash flow'] },
                { month: 'MONTH 3', label: 'Optimise & Scale', color: C.amber, bg: C.amberLight,
                  actions: ['Systemise delivery processes', 'Hire first part-time support if needed', 'Launch referral/repeat-customer incentive', 'Increase marketing to 2–3 new channels', 'Review KPIs and set Month 4–6 targets'] },
              ].map(col => (
                <View key={col.month} style={s.roadmapCol}>
                  <View style={[s.roadmapHeader, { backgroundColor: col.bg }]}>
                    <Text style={[s.roadmapMonth, { color: col.color }]}>{col.month}</Text>
                    <Text style={s.roadmapLabel}>{col.label}</Text>
                  </View>
                  {col.actions.map((action, i) => (
                    <View key={i} style={s.roadmapItem}>
                      <View style={[s.roadmapDot, { backgroundColor: col.color }]} />
                      <Text style={s.roadmapText}>{action}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Licenses */}
          {idea.licenses_required && idea.licenses_required.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <SectionLabel>REQUIRED LICENSES &amp; REGISTRATIONS</SectionLabel>
              <View style={s.chipRow}>
                {idea.licenses_required.map(lic => (
                  <View key={lic} style={s.chip}>
                    <Text style={s.chipTick}>✓</Text>
                    <Text style={s.chipText}>{lic}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Things to note */}
          {idea.things_to_note && idea.things_to_note.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <SectionLabel>OPERATIONAL WATCHPOINTS</SectionLabel>
              {idea.things_to_note.map((item, i) => (
                <View key={i} style={s.listItem}>
                  <Text style={[s.listBullet, { color: C.amber }]}>!</Text>
                  <Text style={s.listText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Footer page={5} total={totalPages} />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 6 · PROOF & RESOURCES
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.bodyPage}>
        <PageHeader title="MARKET PROOF & RESOURCES" ideaTitle={idea.title} />
        <View style={s.body}>

          {/* Proof points */}
          {idea.proof_points && idea.proof_points.length > 0 && (
            <View>
              <SectionLabel>REAL-WORLD VALIDATION</SectionLabel>
              {idea.proof_points.map(pp => (
                <View key={pp._key} style={[s.proofCard, {
                  backgroundColor: pp.type === 'Case Study' ? C.indigoLight
                    : pp.type === 'Government Source' ? C.greenLight : C.amberLight,
                }]}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={[s.proofBadge, {
                      backgroundColor: pp.type === 'Case Study' ? C.indigoPale : pp.type === 'Government Source' ? C.greenPale : C.amberPale,
                      color: pp.type === 'Case Study' ? '#1E1B4B' : pp.type === 'Government Source' ? '#14532D' : '#78350F',
                    }]}>{pp.type}</Text>
                    <Text style={s.proofSource}>{pp.source}{pp.founder ? ` · ${pp.founder}` : ''}</Text>
                  </View>
                  <Text style={s.proofHeadline}>{pp.headline}</Text>
                  {pp.key_stat && <Text style={s.proofStat}>{pp.key_stat}</Text>}
                  {pp.quote && <Text style={s.proofQuote}>"{pp.quote}"</Text>}
                  {pp.url && <Link src={pp.url} style={{ fontSize: 8, color: C.indigo, marginTop: 3 }}>{pp.url}</Link>}
                </View>
              ))}
            </View>
          )}

          {/* Revenue model */}
          {idea.revenue_model && idea.revenue_model.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <SectionLabel>REVENUE MODEL</SectionLabel>
              <View style={s.chipRow}>
                {idea.revenue_model.map(r => (
                  <View key={r} style={[s.chip, { backgroundColor: C.greenLight, borderColor: C.greenPale }]}>
                    <Text style={[s.chipText, { color: C.green, fontFamily: 'Helvetica-Bold' }]}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* CTA box */}
          <View style={{ marginTop: 28, backgroundColor: C.indigoDeep, borderRadius: 10, padding: 20 }}>
            <Text style={{ fontSize: 8, color: C.indigoPale, fontFamily: 'Helvetica-Bold', letterSpacing: 2, marginBottom: 6 }}>
              READY TO START?
            </Text>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 8 }}>
              Get personalised guidance for {idea.title}
            </Text>
            <Text style={{ fontSize: 9, color: '#C7D2FE', lineHeight: 1.5, marginBottom: 12 }}>
              BusinessIdeas.live curates validated, India-specific business ideas with real founder stories,
              government data, and step-by-step launch support.
            </Text>
            <Link src="https://businessideas.live" style={{ fontSize: 9, color: C.indigoPale, fontFamily: 'Helvetica-Bold' }}>
              businessideas.live
            </Link>
          </View>
        </View>
        <Footer page={6} total={totalPages} />
      </Page>

    </Document>
  )
}
