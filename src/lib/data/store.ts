// Data store interface + factory.
// The app talks to this interface; the concrete implementation is either
// SupabaseStore (production Supabase, default), MockStore (in-memory, empty),
// or PrismaStore (Prisma + SQLite, legacy).

import {
  User, Partner, Product, Deal, Offer, Demand, SharedDocument,
  AuditLog, Setting, UserTask, InventoryMovement, EntityNote,
  DashboardInsights,
  Invoice, Proforma, DocumentRegisterEntry, DocumentRevision,
  VaultSecret, ApiKey, Webhook,
  SecuritySession, LoginHistoryEntry, KnownIp, TrustedDevice,
  MailQueueEntry,
  Tenant, ProductCatalogEntry, SupplierOffer, TradeCalculation,
  PortalAccess, DocumentTemplate, DocumentVerification, VerificationLog,
  TenantLetterhead, TenantSeal,
  KycSubmission, KycDocument, PortalRfq,
  TenantFeatureFlags,
  Notification, NotificationType,
  CommissionAgent, DealCommission, CommissionPayout, CommissionSummary,
  ErpAccount, FiscalPeriod, ErpJournalEntry, ErpJournalLine,
  ErpCostCenter, ErpBankAccount, ErpBankTransaction, ErpSetting,
  TrialBalance, BalanceSheet, ProfitAndLoss, GeneralLedger,
  UserPreference,
} from "@/lib/supabase/types";

export interface ListParams {
  search?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, string | undefined>;
}

export interface ListResult<T> {
  items: T[];
  total: number;
}

export interface Store {
  // auth
  getUserByUsername(username: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  listUsers(tenantId: string): Promise<User[]>;
  upsertUser(u: Partial<User> & { id?: string }): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserLastLogin(id: string, ip: string): Promise<void>;
  bumpUserTokenVersion(id: string): Promise<number>;

  // partners
  listPartners(tenantId: string, params?: ListParams): Promise<ListResult<Partner>>;
  getPartner(id: string): Promise<Partner | null>;
  upsertPartner(p: Partial<Partner> & { id?: string }): Promise<Partner>;
  deletePartner(id: string): Promise<void>;

  // products
  listProducts(tenantId: string, params?: ListParams): Promise<ListResult<Product>>;
  getProduct(id: string): Promise<Product | null>;
  upsertProduct(p: Partial<Product> & { id?: string }): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // deals
  listDeals(tenantId: string, params?: ListParams): Promise<ListResult<Deal>>;
  getDeal(id: string): Promise<Deal | null>;
  upsertDeal(d: Partial<Deal> & { id?: string }): Promise<Deal>;
  deleteDeal(id: string): Promise<void>;

  // offers
  listOffers(tenantId: string, params?: ListParams): Promise<ListResult<Offer>>;
  getOffer(id: string): Promise<Offer | null>;
  upsertOffer(o: Partial<Offer> & { id?: string }): Promise<Offer>;
  deleteOffer(id: string): Promise<void>;

  // demands
  listDemands(tenantId: string, params?: ListParams): Promise<ListResult<Demand>>;
  getDemand(id: string): Promise<Demand | null>;
  upsertDemand(d: Partial<Demand> & { id?: string }): Promise<Demand>;
  deleteDemand(id: string): Promise<void>;

  // invoices
  listInvoices(tenantId: string, params?: ListParams): Promise<ListResult<Invoice>>;
  getInvoice(id: string): Promise<Invoice | null>;
  upsertInvoice(i: Partial<Invoice> & { id?: string }): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;

  // proformas
  listProformas(tenantId: string, params?: ListParams): Promise<ListResult<Proforma>>;
  getProforma(id: string): Promise<Proforma | null>;
  upsertProforma(p: Partial<Proforma> & { id?: string }): Promise<Proforma>;
  deleteProforma(id: string): Promise<void>;

  // shared documents
  listDocuments(tenantId: string, params?: ListParams): Promise<ListResult<SharedDocument>>;
  getDocument(id: string): Promise<SharedDocument | null>;
  upsertDocument(d: Partial<SharedDocument> & { id?: string }): Promise<SharedDocument>;
  deleteDocument(id: string): Promise<void>;

  // document register (V1/V2/V3)
  listDocumentRegister(tenantId: string, params?: ListParams): Promise<ListResult<DocumentRegisterEntry>>;
  upsertDocumentRegisterEntry(e: Partial<DocumentRegisterEntry> & { id?: string }): Promise<DocumentRegisterEntry>;
  listDocumentRevisions(tenantId: string, documentId: string): Promise<DocumentRevision[]>;
  addDocumentRevision(r: Partial<DocumentRevision> & { id?: string }): Promise<DocumentRevision>;
  deleteDocumentRegisterEntry(id: string): Promise<void>;

  // audit
  listAudit(tenantId: string, params?: ListParams): Promise<ListResult<AuditLog>>;
  appendAudit(entry: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog>;

  // settings
  getSetting<T = unknown>(key: string, tenantId?: string | null): Promise<T | null>;
  setSetting(key: string, value: unknown, tenantId?: string | null): Promise<void>;
  getAllSettings(tenantId?: string | null): Promise<Setting[]>;

  // tasks
  listTasks(tenantId: string, userId?: string): Promise<UserTask[]>;
  upsertTask(t: Partial<UserTask> & { id?: string }): Promise<UserTask>;
  deleteTask(id: string): Promise<void>;

  // notes
  listNotes(tenantId: string, entityType: string, entityId: string): Promise<EntityNote[]>;
  upsertNote(n: Partial<EntityNote> & { id?: string }): Promise<EntityNote>;
  deleteNote(id: string): Promise<void>;

  // inventory
  listInventory(tenantId: string, partnerId: string): Promise<InventoryMovement[]>;
  listAllInventory(tenantId: string, params?: ListParams): Promise<ListResult<InventoryMovement>>;
  addInventoryMovement(m: Partial<InventoryMovement> & { id?: string }): Promise<InventoryMovement>;

  // vault
  listVault(tenantId: string, params?: ListParams): Promise<ListResult<VaultSecret>>;
  upsertVaultSecret(s: Partial<VaultSecret> & { id?: string }): Promise<VaultSecret>;
  deleteVaultSecret(id: string): Promise<void>;

  // api keys
  listApiKeys(tenantId: string): Promise<ApiKey[]>;
  upsertApiKey(k: Partial<ApiKey> & { id?: string }): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;
  authenticateApiKey(rawKey: string): Promise<{ apiKey: ApiKey; tenantId: string } | null>;
  updateApiKeyLastUsed(id: string, ip: string): Promise<void>;

  // webhooks
  listWebhooks(tenantId: string): Promise<Webhook[]>;
  upsertWebhook(w: Partial<Webhook> & { id?: string }): Promise<Webhook>;
  deleteWebhook(id: string): Promise<void>;

  // security
  listSessions(tenantId: string, userId?: string): Promise<SecuritySession[]>;
  revokeSession(id: string): Promise<void>;
  listLoginHistory(tenantId: string, userId?: string, limit?: number): Promise<LoginHistoryEntry[]>;
  listKnownIps(tenantId: string, userId?: string): Promise<KnownIp[]>;
  trustIp(id: string, trusted: boolean): Promise<void>;
  forgetIp(id: string): Promise<void>;
  listTrustedDevices(tenantId: string, userId?: string): Promise<TrustedDevice[]>;
  revokeTrustedDevice(id: string): Promise<void>;

  // mail queue
  listMailQueue(tenantId: string, params?: ListParams): Promise<ListResult<MailQueueEntry>>;
  upsertMailQueueEntry(m: Partial<MailQueueEntry> & { id?: string }): Promise<MailQueueEntry>;
  deleteMailQueueEntry(id: string): Promise<void>;

  // ---- tenants (multi-tenancy) ----
  listTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | null>;
  upsertTenant(t: Partial<Tenant> & { id?: string }): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;

  // ---- product catalog ----
  listProductCatalog(tenantId: string, params?: ListParams): Promise<ListResult<ProductCatalogEntry>>;
  getProductCatalogEntry(id: string): Promise<ProductCatalogEntry | null>;
  upsertProductCatalogEntry(p: Partial<ProductCatalogEntry> & { id?: string }): Promise<ProductCatalogEntry>;
  deleteProductCatalogEntry(id: string): Promise<void>;

  // ---- supplier offers ----
  listSupplierOffers(tenantId: string, params?: ListParams): Promise<ListResult<SupplierOffer>>;
  getSupplierOffer(id: string): Promise<SupplierOffer | null>;
  upsertSupplierOffer(s: Partial<SupplierOffer> & { id?: string }): Promise<SupplierOffer>;
  deleteSupplierOffer(id: string): Promise<void>;

  // ---- trade calculations ----
  listTradeCalculations(tenantId: string, params?: ListParams): Promise<ListResult<TradeCalculation>>;
  getTradeCalculation(id: string): Promise<TradeCalculation | null>;
  upsertTradeCalculation(t: Partial<TradeCalculation> & { id?: string }): Promise<TradeCalculation>;
  deleteTradeCalculation(id: string): Promise<void>;

  // ---- portal access ----
  getPortalAccessByPartner(partnerId: string): Promise<PortalAccess | null>;
  getPortalAccessByEmail(tenantId: string, email: string): Promise<PortalAccess | null>;
  getPortalAccessById(id: string): Promise<PortalAccess | null>;
  listPortalAccess(tenantId: string): Promise<PortalAccess[]>;
  upsertPortalAccess(p: Partial<PortalAccess> & { id?: string }): Promise<PortalAccess>;
  deletePortalAccess(id: string): Promise<void>;
  verifyPortalCredentials(tenantId: string, email: string, password: string): Promise<PortalAccess | null>;
  verifyPortalCredentialsByEmail(email: string, password: string): Promise<PortalAccess | null>;
  getPortalAccessByEmailAnyTenant(email: string): Promise<PortalAccess | null>;
  /** Find all portal access rows matching an email across all tenants (for multi-tenant discrimination). */
  listPortalAccessByEmail(email: string): Promise<PortalAccess[]>;

  // ---- document templates ----
  listDocumentTemplates(tenantId: string): Promise<DocumentTemplate[]>;
  getDocumentTemplate(id: string): Promise<DocumentTemplate | null>;
  getDefaultDocumentTemplate(tenantId: string, type: string): Promise<DocumentTemplate | null>;
  upsertDocumentTemplate(t: Partial<DocumentTemplate> & { id?: string }): Promise<DocumentTemplate>;
  deleteDocumentTemplate(id: string): Promise<void>;

  // ---- tenant letterheads (memorandum firme) ----
  listLetterheads(tenantId: string): Promise<TenantLetterhead[]>;
  getLetterhead(id: string): Promise<TenantLetterhead | null>;
  getDefaultLetterhead(tenantId: string): Promise<TenantLetterhead | null>;
  upsertLetterhead(l: Partial<TenantLetterhead> & { id?: string; tenant_id: string }): Promise<TenantLetterhead>;
  deleteLetterhead(id: string): Promise<void>;

  // ---- tenant seals (zigled) ----
  listSeals(tenantId: string): Promise<TenantSeal[]>;
  getSeal(id: string): Promise<TenantSeal | null>;
  getDefaultSeal(tenantId: string): Promise<TenantSeal | null>;
  upsertSeal(s: Partial<TenantSeal> & { id?: string; tenant_id: string }): Promise<TenantSeal>;
  deleteSeal(id: string): Promise<void>;

  // ---- security (write methods) ----
  createSession(s: { user_id: string; ip?: string | null; user_agent?: string | null; country?: string | null; expires_at: string; current?: boolean }): Promise<SecuritySession>;
  revokeSessionById(id: string): Promise<void>;
  touchSession(id: string): Promise<void>;
  recordLoginHistory(e: { user_id: string; username: string; ip?: string | null; user_agent?: string | null; country?: string | null; success: boolean; reason?: string | null }): Promise<LoginHistoryEntry>;
  upsertKnownIp(ip: { user_id: string; ip: string; country?: string | null; trusted?: boolean }): Promise<KnownIp>;
  upsertTrustedDevice(d: { user_id: string; device_name: string; fingerprint: string; ip?: string | null }): Promise<TrustedDevice>;
  revokeTrustedDeviceById(id: string): Promise<void>;

  // ---- document verification ----
  createDocumentVerification(v: Omit<DocumentVerification, "id" | "created_at" | "verification_count" | "last_verified_at" | "last_verified_ip" | "status"> & { status?: string }): Promise<DocumentVerification>;
  getDocumentVerificationByCode(code: string): Promise<DocumentVerification | null>;
  getDocumentVerificationByDoc(tenantId: string, docType: string, docId: string): Promise<DocumentVerification | null>;
  logVerification(log: Omit<VerificationLog, "id" | "verified_at">): Promise<VerificationLog>;
  listVerificationLogs(verificationId: string): Promise<VerificationLog[]>;

  // ---- KYC submissions ----
  listKycSubmissions(tenantId: string, params?: ListParams): Promise<ListResult<KycSubmission>>;
  getKycSubmission(id: string): Promise<KycSubmission | null>;
  getKycSubmissionByPartner(partnerId: string): Promise<KycSubmission | null>;
  upsertKycSubmission(s: Partial<KycSubmission> & { id?: string }): Promise<KycSubmission>;
  deleteKycSubmission(id: string): Promise<void>;
  addKycDocument(doc: Omit<KycDocument, "id" | "uploaded_at">): Promise<KycDocument>;
  removeKycDocument(id: string): Promise<void>;
  approveKycAndTransfer(submissionId: string, reviewedBy: string): Promise<{ submission: KycSubmission; partner: Partner }>;

  // ---- portal RFQs ----
  listPortalRfqs(tenantId: string, params?: ListParams): Promise<ListResult<PortalRfq>>;
  listPortalRfqsByPartner(partnerId: string): Promise<PortalRfq[]>;
  getPortalRfq(id: string): Promise<PortalRfq | null>;
  upsertPortalRfq(r: Partial<PortalRfq> & { id?: string }): Promise<PortalRfq>;
  deletePortalRfq(id: string): Promise<void>;

  // ---- feature flags ----
  getFeatureFlags(tenantId: string): Promise<TenantFeatureFlags | null>;
  upsertFeatureFlags(f: Partial<TenantFeatureFlags> & { id?: string; tenant_id: string }): Promise<TenantFeatureFlags>;

  // ---- notifications ----
  listNotifications(tenantId: string, userId?: string, unreadOnly?: boolean): Promise<Notification[]>;
  listNotificationsByPartner(tenantId: string, partnerId: string): Promise<Notification[]>;
  createNotification(n: Omit<Notification, "id" | "created_at" | "read" | "read_at">): Promise<Notification>;
  markNotificationRead(id: string, tenantId: string): Promise<void>;
  markAllNotificationsRead(tenantId: string, userId: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  getUnreadCount(tenantId: string, userId: string): Promise<number>;
  getNotificationById(id: string): Promise<Notification | null>;

  // user preferences
  getUserPreference(userId: string, key: string): Promise<UserPreference | null>;
  setUserPreference(userId: string, key: string, value: unknown): Promise<UserPreference>;
  deleteUserPreference(userId: string, key: string): Promise<void>;
  listUserPreferences(userId: string): Promise<UserPreference[]>;

  // dashboard
  getInsights(tenantId?: string): Promise<DashboardInsights>;

  // ---- commission agents ----
  listCommissionAgents(tenantId: string, params?: ListParams): Promise<ListResult<CommissionAgent>>;
  getCommissionAgent(id: string): Promise<CommissionAgent | null>;
  getCommissionAgentByPartner(partnerId: string): Promise<CommissionAgent | null>;
  upsertCommissionAgent(a: Partial<CommissionAgent> & { id?: string }): Promise<CommissionAgent>;
  deleteCommissionAgent(id: string): Promise<void>;

  // ---- deal commissions ----
  listDealCommissions(tenantId: string, params?: ListParams): Promise<ListResult<DealCommission>>;
  listDealCommissionsByDeal(dealId: string): Promise<DealCommission[]>;
  listDealCommissionsByAgent(agentId: string): Promise<DealCommission[]>;
  getDealCommission(id: string): Promise<DealCommission | null>;
  upsertDealCommission(c: Partial<DealCommission> & { id?: string }): Promise<DealCommission>;
  deleteDealCommission(id: string): Promise<void>;
  approveDealCommission(id: string, approvedBy: string): Promise<DealCommission>;
  markDealCommissionPaid(id: string, payoutReference?: string): Promise<DealCommission>;

  // ---- commission payouts ----
  listCommissionPayouts(tenantId: string, params?: ListParams): Promise<ListResult<CommissionPayout>>;
  getCommissionPayout(id: string): Promise<CommissionPayout | null>;
  upsertCommissionPayout(p: Partial<CommissionPayout> & { id?: string }): Promise<CommissionPayout>;
  deleteCommissionPayout(id: string): Promise<void>;

  // ---- commission summaries ----
  getCommissionSummaries(tenantId: string): Promise<CommissionSummary[]>;
  calculateCommission(agentId: string, dealValue: number, dealProfit: number, dealQuantity: number, dealUnit: string, currency: string): Promise<number>;

  // ---- ERP / Accounting ----
  // Chart of Accounts
  listErpAccounts(tenantId: string, params?: ListParams): Promise<ListResult<ErpAccount>>;
  getErpAccount(id: string): Promise<ErpAccount | null>;
  upsertErpAccount(a: Partial<ErpAccount> & { id?: string }): Promise<ErpAccount>;
  deleteErpAccount(id: string): Promise<void>;

  // Fiscal Periods
  listFiscalPeriods(tenantId: string, params?: ListParams): Promise<ListResult<FiscalPeriod>>;
  getFiscalPeriod(id: string): Promise<FiscalPeriod | null>;
  upsertFiscalPeriod(p: Partial<FiscalPeriod> & { id?: string }): Promise<FiscalPeriod>;
  closeFiscalPeriod(id: string, closedBy: string): Promise<FiscalPeriod>;

  // Journal Entries
  listErpJournalEntries(tenantId: string, params?: ListParams): Promise<ListResult<ErpJournalEntry>>;
  getErpJournalEntry(id: string): Promise<ErpJournalEntry | null>;
  upsertErpJournalEntry(e: Partial<ErpJournalEntry> & { id?: string; lines?: Partial<ErpJournalLine & { id?: string }>[] }): Promise<ErpJournalEntry>;
  postErpJournalEntry(id: string, postedBy: string): Promise<ErpJournalEntry>;
  reverseErpJournalEntry(id: string, reversedBy: string): Promise<ErpJournalEntry>;
  deleteErpJournalEntry(id: string): Promise<void>;

  // Cost Centers
  listErpCostCenters(tenantId: string, params?: ListParams): Promise<ListResult<ErpCostCenter>>;
  upsertErpCostCenter(c: Partial<ErpCostCenter> & { id?: string }): Promise<ErpCostCenter>;
  deleteErpCostCenter(id: string): Promise<void>;

  // Bank Accounts
  listErpBankAccounts(tenantId: string): Promise<ErpBankAccount[]>;
  upsertErpBankAccount(b: Partial<ErpBankAccount> & { id?: string }): Promise<ErpBankAccount>;
  deleteErpBankAccount(id: string): Promise<void>;

  // Bank Transactions
  listErpBankTransactions(tenantId: string, bankAccountId?: string, params?: ListParams): Promise<ListResult<ErpBankTransaction>>;
  upsertErpBankTransaction(t: Partial<ErpBankTransaction> & { id?: string }): Promise<ErpBankTransaction>;
  reconcileBankTransaction(id: string, journalEntryId: string): Promise<ErpBankTransaction>;

  // ERP Settings
  getErpSettings(tenantId: string): Promise<ErpSetting | null>;
  upsertErpSettings(s: Partial<ErpSetting> & { id?: string; tenant_id: string }): Promise<ErpSetting>;

  // ERP Reports
  getTrialBalance(tenantId: string, asOfDate: string): Promise<TrialBalance>;
  getBalanceSheet(tenantId: string, asOfDate: string): Promise<BalanceSheet>;
  getProfitAndLoss(tenantId: string, periodStart: string, periodEnd: string): Promise<ProfitAndLoss>;
  getGeneralLedger(tenantId: string, accountId: string, dateFrom?: string, dateTo?: string): Promise<GeneralLedger>;

  // Auto-create journal entries from business events
  autoJournalFromInvoice(invoiceId: string, tenantId: string, userId: string): Promise<ErpJournalEntry | null>;
  autoJournalFromDeal(dealId: string, tenantId: string, userId: string): Promise<ErpJournalEntry | null>;
  autoJournalFromCommission(commissionId: string, tenantId: string, userId: string): Promise<ErpJournalEntry | null>;
}

let _impl: Store | null = null;

export async function getStore(): Promise<Store> {
  if (_impl) return _impl;

  // Production always uses SupabaseStore. PrismaStore and MockStore are legacy
  // and kept only for backward compatibility — they can be re-enabled by
  // setting DB_BACKEND=prisma or DB_BACKEND=mock (not recommended for production).
  const backend = process.env.DB_BACKEND;

  if (backend === "prisma") {
    console.warn("[store] DB_BACKEND=prisma is DEPRECATED. PrismaStore has known tenant isolation bugs. Use DB_BACKEND=supabase.");
    const { PrismaStore } = await import("./prisma-store");
    _impl = new PrismaStore() as unknown as Store;
  } else if (backend === "mock") {
    console.warn("[store] DB_BACKEND=mock has no seed data. Use only for testing.");
    const { MockStore } = await import("./mock-store");
    _impl = new MockStore() as unknown as Store;
  } else {
    const { SupabaseStore } = await import("./supabase-store");
    _impl = new SupabaseStore() as unknown as Store;
  }
  return _impl;
}

export function getStoreSync(): Store | null {
  return _impl;
}
