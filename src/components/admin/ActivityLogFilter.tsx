/**
 * Activity Log Filter
 * Filter activity by role, type, and date range (Admin only)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface ActivityFilters {
  role?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface ActivityLogFilterProps {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  activeCount?: number;
}

export function ActivityLogFilter({
  filters,
  onFiltersChange,
  activeCount = 0,
}: ActivityLogFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof ActivityFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setShowFilters(false);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex items-center gap-2">
      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            className="h-9"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filter Activity</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={filters.role || "all"}
                onValueChange={(value) =>
                  updateFilter("role", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      🛡️ Admin
                    </span>
                  </SelectItem>
                  <SelectItem value="stylist">
                    <span className="flex items-center gap-2">
                      ✂️ Stylist
                    </span>
                  </SelectItem>
                  <SelectItem value="client">
                    <span className="flex items-center gap-2">
                      👤 Client
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Type</label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  updateFilter("type", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="appointment">Appointments</SelectItem>
                  <SelectItem value="client">Client Actions</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? (
                        format(filters.dateFrom, "MMM d")
                      ) : (
                        "From"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => updateFilter("dateFrom", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "MMM d") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => updateFilter("dateTo", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.role && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1"
              onClick={() => updateFilter("role", undefined)}
            >
              Role: {filters.role}
              <X className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-destructive" />
            </Badge>
          )}
          {filters.type && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1"
              onClick={() => updateFilter("type", undefined)}
            >
              Type: {filters.type}
              <X className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-destructive" />
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1"
              onClick={() => {
                updateFilter("dateFrom", undefined);
                updateFilter("dateTo", undefined);
              }}
            >
              {filters.dateFrom && format(filters.dateFrom, "MMM d")}
              {filters.dateFrom && filters.dateTo && " - "}
              {filters.dateTo && format(filters.dateTo, "MMM d")}
              <X className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-destructive" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
