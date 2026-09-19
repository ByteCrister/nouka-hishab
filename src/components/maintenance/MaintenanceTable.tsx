'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MaintenanceListItem } from '@/types/maintenance.types';

interface MaintenanceTableProps {
  items: MaintenanceListItem[];
  isLoading: boolean;
  onEdit: (item: MaintenanceListItem) => void;
  onDelete: (item: MaintenanceListItem) => void;
}

export function MaintenanceTable({ items, isLoading, onEdit, onDelete }: MaintenanceTableProps) {
  const t = useTranslations('maintenance');

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <p className="text-muted-foreground">{t('table.loading')}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center border rounded-xl bg-card">
        <p className="text-muted-foreground">{t('table.noData')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.date')}</TableHead>
            <TableHead>{t('table.boatName')}</TableHead>
            <TableHead>{t('table.description')}</TableHead>
            <TableHead>{t('table.vendor')}</TableHead>
            <TableHead className="text-right">{t('table.cost')}</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {new Date(item.maintenanceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </TableCell>
              <TableCell className="font-medium">{item.boatName}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.vendorName || '-'}</TableCell>
              <TableCell className="text-right">
                {item.costTk != null ? `৳ ${item.costTk.toLocaleString()}` : '-'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {t('actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(item)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
