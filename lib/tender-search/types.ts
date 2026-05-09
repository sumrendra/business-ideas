export type TenderSource = 'gem' | 'cppp' | 'mahatenders' | 'mstc' | 'kppp'
export type TenderStatus = 'active' | 'closed' | 'awarded' | 'cancelled'

export interface Tender {
  id: string
  source: TenderSource
  bidNo: string
  title: string
  organization: string
  ministry: string
  department?: string
  category: string
  state: string
  tenderValue: number | null
  bidDeadline: string | null
  publishedAt: string
  status: TenderStatus
  documentUrl: string
  description?: string
  itemDescription?: string
  quantity?: string
  l1SellerName?: string
  l1Price?: number
  totalBidders?: number
}

export interface BidRecord {
  bidId: string
  bidNo: string
  category: string
  itemDescription: string
  ministry: string
  organization: string
  state: string
  l1Price: number
  l1SellerName: string
  bidClosingDate: string
  totalBidders: number
  estimatedValue: number | null
  savingsPercent?: number
}

export interface VendorRecord {
  sellerName: string
  state: string
  category: string
  totalOrders: number
  totalOrderValueINR: number
  avgOrderValueINR: number
  topMinistries: string[]
}

export interface SearchFilters {
  q?: string
  state?: string
  ministry?: string
  category?: string
  minValue?: number
  maxValue?: number
  status?: TenderStatus
  deadlineDays?: number
}

export interface TenderSearchResponse {
  tenders: Tender[]
  total: number
  generatedAt: string
  durationMs: number
  dataNote: string
}

export interface BidHistoryResponse {
  bids: BidRecord[]
  summary: {
    avgL1Price: number
    medianL1Price: number
    lowestL1Price: number
    totalBids: number
    avgBidders: number
    avgSavings: number
  }
  generatedAt: string
  durationMs: number
}

export interface VendorResponse {
  vendors: VendorRecord[]
  total: number
  generatedAt: string
  durationMs: number
}
