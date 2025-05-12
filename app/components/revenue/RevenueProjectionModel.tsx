import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useRevenueProjectionModel } from "@/app/hooks/use-revenue-projection-model"
import { Users, DollarSign, Briefcase, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export function RevenueProjectionModel() {
  const {
    params,
    previewParams,
    updateParam,
    resetParams,
    applyParams,
    isLoading,
    errors,
    monthlyRevenue,
    annualRevenue,
    projectedRevenue,
    profitMargin,
    previewMonthlyRevenue,
    previewAnnualRevenue,
    previewProjectedRevenue,
    previewProfitMargin
  } = useRevenueProjectionModel();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const hasChanges = JSON.stringify(params) !== JSON.stringify(previewParams);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Projection Model</CardTitle>
        <CardDescription>Adjust parameters to forecast revenue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employee-count">Employee Count</Label>
            <div className="flex items-center gap-2">
              <Input
                id="employee-count"
                type="number"
                value={previewParams.employeeCount}
                onChange={(e) => updateParam('employeeCount', e.target.value)}
                className={cn("flex-1", errors.employeeCount && "border-red-500")}
                min="0"
              />
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            {errors.employeeCount && (
              <p className="text-sm text-red-500">{errors.employeeCount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="average-salary">Average Salary ($)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="average-salary"
                type="number"
                value={previewParams.averageSalary}
                onChange={(e) => updateParam('averageSalary', e.target.value)}
                className={cn("flex-1", errors.averageSalary && "border-red-500")}
                min="0"
              />
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            {errors.averageSalary && (
              <p className="text-sm text-red-500">{errors.averageSalary}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="revenue-per-employee">Monthly Revenue per Employee ($)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="revenue-per-employee"
              type="number"
              value={previewParams.revenuePerEmployee}
              onChange={(e) => updateParam('revenuePerEmployee', e.target.value)}
              className={cn("flex-1", errors.revenuePerEmployee && "border-red-500")}
              min="0"
            />
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          {errors.revenuePerEmployee && (
            <p className="text-sm text-red-500">{errors.revenuePerEmployee}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="growth-rate">Growth Rate (%)</Label>
            <span className="text-sm">{previewParams.growthRate.toFixed(1)}%</span>
          </div>
          <Slider
            id="growth-rate"
            min={0}
            max={20}
            step={0.5}
            value={[previewParams.growthRate]}
            onValueChange={(value) => updateParam('growthRate', value[0])}
            className={cn("transition-all", errors.growthRate && "border-red-500")}
          />
          {errors.growthRate && (
            <p className="text-sm text-red-500">{errors.growthRate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeframe">Projection Timeframe</Label>
          <Select 
            value={previewParams.projectionTimeframe} 
            onValueChange={(value) => updateParam('projectionTimeframe', value)}
          >
            <SelectTrigger id="timeframe">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
              <SelectItem value="24months">24 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Monthly Revenue</Label>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyRevenue)}
              {hasChanges && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  → {formatCurrency(previewMonthlyRevenue)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Annual Revenue</Label>
            <div className="text-2xl font-bold">
              {formatCurrency(annualRevenue)}
              {hasChanges && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  → {formatCurrency(previewAnnualRevenue)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Projected Revenue</Label>
            <div className="text-2xl font-bold">
              {formatCurrency(projectedRevenue)}
              {hasChanges && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  → {formatCurrency(previewProjectedRevenue)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profit Margin</Label>
            <div className="text-2xl font-bold">
              {profitMargin.toFixed(1)}%
              {hasChanges && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  → {previewProfitMargin.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={resetParams}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button
            onClick={applyParams}
            disabled={isLoading || !hasChanges || Object.keys(errors).length > 0}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply Changes'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 