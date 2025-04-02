
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Info } from 'lucide-react';

interface TokenProgressCardProps {
  threshold: string;
  vbnb: string;
  vtok: string;
  progress: number;
  migrated: boolean;
}

const TokenProgressCard = ({ threshold, vbnb, vtok, progress, migrated }: TokenProgressCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Migration Progress</CardTitle>
        <CardDescription>Current migration status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Progress toward migration</span>
          <span className="text-sm font-medium">{progress.toFixed(2)}%</span>
        </div>
        <Progress value={progress} className="h-2.5" />
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">Threshold (BNB)</div>
            <div className="font-semibold">{parseFloat(threshold).toFixed(6)}</div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">Virtual BNB (VBNB)</div>
            <div className="font-semibold">{parseFloat(vbnb).toFixed(6)}</div>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">Virtual Token (VTOK)</div>
          <div className="font-semibold">{parseFloat(vtok).toFixed(6)}</div>
        </div>
        
        {migrated && (
          <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mt-2">
            <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div className="text-sm text-green-700 dark:text-green-400">
              This token has already migrated
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenProgressCard;
