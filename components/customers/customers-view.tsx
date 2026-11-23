"use client";

import { PlusIcon, SearchIcon, WhatsAppIcon } from "@/components/app/icons";
import { CustomersScene } from "@/components/illustrations/scenes";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { apiGet, apiSend } from "@/lib/api-client";
import type { Customer } from "@/lib/customers";
import {
  listLocalCustomers,
  upsertLocalCustomer,
} from "@/lib/local-customers";
import { formatNaira } from "@/lib/money";
import { DEFAULT_PAGE_SIZE, paginateItems } from "@/lib/pagination";
import { isValidNgPhone, normalizeNgPhone } from "@/lib/validation";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

export function CustomersView({
  customers: initial = [],
}: {
  customers?: Customer[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(initial);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const remote = await apiGet<{ customers: Customer[] }>("/api/customers");
      if (cancelled) return;
      if (remote?.customers) {
        setList(remote.customers);
        return;
      }
      setList(listLocalCustomers());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) ||
        customer.phone.includes(q) ||
        customer.email?.toLowerCase().includes(q),
    );
  }, [list, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const paged = useMemo(
    () => paginateItems(filtered, page, DEFAULT_PAGE_SIZE),
    [filtered, page],
  );

  async function addCustomer(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Name and WhatsApp number are required.");
      return;
    }
    if (!isValidNgPhone(phone)) {
      setError("Enter a valid Nigerian WhatsApp number (e.g. 0803…).");
      return;
    }
    const payload: Customer = {
      id: `local-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      documentsCount: 0,
      owedKobo: 0,
    };

    const remote = await apiSend<{ customer: Customer }>(
      "/api/customers",
      "POST",
      payload,
    );
    if (remote.ok) {
      const refreshed = await apiGet<{ customers: Customer[] }>("/api/customers");
      setList(refreshed?.customers || [remote.data.customer, ...list]);
      setPage(1);
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
      return;
    }

    const result = upsertLocalCustomer(payload);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setList(result.customers);
    setPage(1);
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="motion-stagger grid gap-5">
      <header
        data-tour="customers-hero"
        className="flex flex-col gap-4 @[42rem]/main:flex-row @[42rem]/main:items-end @[42rem]/main:justify-between"
      >
        <div>
          <h1 className="text-[1.65rem] font-semibold tracking-tight sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1.5 text-sm text-muted sm:text-base">
            Save them once, then pick them when you create an invoice.
          </p>
        </div>
        <Link
          href="/documents/new"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background @[42rem]/main:w-auto"
        >
          <PlusIcon className="size-4" />
          Invoice a customer
        </Link>
      </header>

      <div className="grid gap-5 @[56rem]/main:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form
          onSubmit={addCustomer}
          className="app-panel h-fit rounded-[1.35rem] border border-border bg-surface p-5"
        >
          <h2 className="text-base font-semibold">Add customer</h2>
          <p className="mt-1 text-sm text-muted">
            Name and WhatsApp number are enough to start. Saved on this device.
          </p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Name</span>
              <input
                className="field-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Chioma Adeyemi"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">WhatsApp number</span>
              <input
                className="field-input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0803…"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Email (optional)</span>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Notes</span>
              <textarea
                className="field-input resize-y"
                rows={2}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>
          {error ? (
            <p className="mt-3 text-xs text-[color-mix(in_oklab,var(--danger)_75%,black)]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
          >
            Save customer
          </button>
          {saved ? (
            <p className="mt-2 text-sm text-brand">Saved on this device.</p>
          ) : null}
        </form>

        <section className="app-panel rounded-[1.35rem] border border-border bg-surface overflow-hidden">
          <div className="border-b border-separator p-4">
            <label className="flex h-11 items-center gap-2.5 rounded-full bg-[#eef2ef] px-3.5 text-sm text-muted">
              <SearchIcon className="size-4 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customers"
                className="w-full bg-transparent outline-none"
                aria-label="Search customers"
              />
            </label>
          </div>

          {filtered.length === 0 ? (
            list.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  className="border-0 bg-transparent shadow-none"
                  illustration={
                    <CustomersScene className="mx-auto h-auto w-full max-w-sm" />
                  }
                  title="No customers yet"
                  body="Add someone here, or load sample data in Settings. Invoicing from a customer keeps WhatsApp filled in."
                />
              </div>
            ) : (
              <div className="px-5 py-14 text-center">
                <p className="font-medium">No matches</p>
                <p className="mt-1 text-sm text-muted">Try another search.</p>
              </div>
            )
          ) : (
            <>
              <ul className="divide-y divide-separator">
                {paged.items.map((customer) => {
                  const wa = normalizeNgPhone(customer.phone);
                  return (
                    <li
                      key={customer.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{customer.name}</p>
                        <p className="mt-0.5 text-sm text-muted">
                          {customer.phone}
                          {customer.owedKobo > 0
                            ? ` · owes ${formatNaira(customer.owedKobo)}`
                            : ""}
                        </p>
                        {customer.notes ? (
                          <p className="mt-1 text-xs text-muted">
                            {customer.notes}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${wa}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white"
                          aria-label={`WhatsApp ${customer.name}`}
                        >
                          <WhatsAppIcon className="size-4 text-brand" />
                        </a>
                        <Link
                          href={`/documents/new?customer=${encodeURIComponent(customer.name)}`}
                          className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-xs font-medium text-background"
                        >
                          Invoice
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Pagination
                page={paged.page}
                pageSize={paged.pageSize}
                totalPages={paged.totalPages}
                total={paged.total}
                start={paged.start}
                end={paged.end}
                hasPrev={paged.hasPrev}
                hasNext={paged.hasNext}
                onPageChange={setPage}
                noun="customers"
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
