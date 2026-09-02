import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  FilterX,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export interface DataColumn<T> {
  key: string;
  header: string;
  /** Raw value used for sorting, searching and CSV export. */
  value?: (row: T) => string | number | null | undefined;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  /** Hidden by default in the column picker. */
  hidden?: boolean;
}

export interface DataFilter<T> {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  match: (row: T, value: string) => boolean;
}

export interface BulkAction<T> {
  label: string;
  destructive?: boolean;
  confirm?: string;
  run: (rows: T[]) => unknown;
}

interface Props<T> {
  rows: T[];
  columns: Array<DataColumn<T>>;
  getId: (row: T) => string;
  loading?: boolean;
  searchPlaceholder?: string;
  filters?: Array<DataFilter<T>>;
  /** Enables a created-after / created-before range using this row date. */
  dateValue?: (row: T) => string | null | undefined;
  dateLabel?: string;
  bulkActions?: Array<BulkAction<T>>;
  rowActions?: (row: T) => ReactNode;
  csvName?: string;
  emptyText?: string;
  initialPageSize?: number;
}

const PAGE_SIZES = [10, 25, 50, 100];

function toText(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

export function DataTable<T>({
  rows,
  columns,
  getId,
  loading = false,
  searchPlaceholder = "Search…",
  filters = [],
  dateValue,
  dateLabel = "Date",
  bulkActions = [],
  rowActions,
  csvName,
  emptyText = "Nothing here yet",
  initialPageSize = 25,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState<string[]>([]);
  const [hiddenCols, setHiddenCols] = useState<string[]>(columns.filter((c) => c.hidden).map((c) => c.key));

  const visibleColumns = columns.filter((c) => !hiddenCols.includes(c.key));

  const cellValue = (row: T, column: DataColumn<T>) =>
    column.value ? column.value(row) : ((row as Record<string, unknown>)[column.key] as string | number | undefined);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (term) {
        const haystack = columns.map((c) => toText(cellValue(row, c)).toLowerCase()).join(" ");
        if (!haystack.includes(term)) return false;
      }
      for (const filter of filters) {
        const value = filterState[filter.key];
        if (value && value !== "__all" && !filter.match(row, value)) return false;
      }
      if (dateValue && (from || to)) {
        const raw = dateValue(row);
        if (!raw) return false;
        const time = new Date(raw).getTime();
        if (from && time < new Date(`${from}T00:00:00`).getTime()) return false;
        if (to && time > new Date(`${to}T23:59:59`).getTime()) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, filterState, from, to, columns, filters, dateValue]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const column = columns.find((c) => c.key === sortKey);
    if (!column) return filtered;
    return [...filtered].sort((a, b) => {
      const av = cellValue(a, column);
      const bv = cellValue(b, column);
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      const cmp = toText(av).localeCompare(toText(bv), undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDir, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const paged = sorted.slice(current * pageSize, current * pageSize + pageSize);
  const selectedRows = sorted.filter((r) => selected.includes(getId(r)));
  const allOnPageSelected = paged.length > 0 && paged.every((r) => selected.includes(getId(r)));
  const hasFilters = Boolean(search || from || to || Object.values(filterState).some((v) => v && v !== "__all"));

  const exportCsv = () => {
    const header = visibleColumns.map((c) => c.header);
    const lines = (selectedRows.length ? selectedRows : sorted).map((row) =>
      visibleColumns.map((c) => `"${toText(cellValue(row, c)).replace(/"/g, '""')}"`).join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${csvName ?? "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setFilterState({});
    setFrom("");
    setTo("");
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>

        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterState[filter.key] ?? "__all"}
            onValueChange={(v) => {
              setFilterState((s) => ({ ...s, [filter.key]: v }));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All {filter.label.toLowerCase()}</SelectItem>
              {filter.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {dateValue ? (
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              aria-label={`${dateLabel} from`}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[150px]"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              aria-label={`${dateLabel} to`}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-[150px]"
            />
          </div>
        ) : null}

        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5">
            <FilterX className="size-4" /> Clear
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Columns3 className="size-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            {columns.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                checked={!hiddenCols.includes(c.key)}
                onCheckedChange={(checked) =>
                  setHiddenCols((h) => (checked ? h.filter((k) => k !== c.key) : [...h, c.key]))
                }
              >
                {c.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {csvName ? (
          <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
            <Download className="size-4" /> CSV
          </Button>
        ) : null}
      </div>

      {bulkActions.length > 0 && selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <span className="font-medium">{selected.length} selected</span>
          {bulkActions.map((action) =>
            action.confirm ? (
              <AlertDialog key={action.label}>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant={action.destructive ? "destructive" : "secondary"}>
                    {action.label}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{action.label}?</AlertDialogTitle>
                    <AlertDialogDescription>{action.confirm}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        void Promise.resolve(action.run(selectedRows)).then(() => setSelected([]));
                      }}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                key={action.label}
                size="sm"
                variant={action.destructive ? "destructive" : "secondary"}
                onClick={() => void Promise.resolve(action.run(selectedRows)).then(() => setSelected([]))}
              >
                {action.label}
              </Button>
            ),
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
            Clear selection
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border p-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState text={rows.length === 0 ? emptyText : "No rows match the current filters"} />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {bulkActions.length > 0 ? (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allOnPageSelected}
                        aria-label="Select all rows on this page"
                        onCheckedChange={(checked) =>
                          setSelected((s) =>
                            checked
                              ? Array.from(new Set([...s, ...paged.map(getId)]))
                              : s.filter((id) => !paged.map(getId).includes(id)),
                          )
                        }
                      />
                    </TableHead>
                  ) : null}
                  {visibleColumns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.sortable === false ? (
                        column.header
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={() => {
                            if (sortKey === column.key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                            else {
                              setSortKey(column.key);
                              setSortDir("asc");
                            }
                          }}
                        >
                          {column.header}
                          {sortKey === column.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="size-3.5" />
                            ) : (
                              <ArrowDown className="size-3.5" />
                            )
                          ) : null}
                        </button>
                      )}
                    </TableHead>
                  ))}
                  {rowActions ? <TableHead className="text-right">Actions</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((row) => {
                  const id = getId(row);
                  return (
                    <TableRow key={id} className={cn(selected.includes(id) && "bg-muted/40")}>
                      {bulkActions.length > 0 ? (
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(id)}
                            aria-label="Select row"
                            onCheckedChange={(checked) =>
                              setSelected((s) => (checked ? [...s, id] : s.filter((x) => x !== id)))
                            }
                          />
                        </TableCell>
                      ) : null}
                      {visibleColumns.map((column) => (
                        <TableCell key={column.key} className={column.className}>
                          {column.render ? column.render(row) : toText(cellValue(row, column))}
                        </TableCell>
                      ))}
                      {rowActions ? <TableCell className="text-right">{rowActions(row)}</TableCell> : null}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {sorted.length === 0
            ? "0 results"
            : `${current * pageSize + 1}–${Math.min(sorted.length, (current + 1) * pageSize)} of ${sorted.length}`}
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" disabled={current === 0} onClick={() => setPage(current - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="tabular-nums">
            {current + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
