
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SlippageSettingsProps {
  slippage: string;
  setSlippage: (value: string) => void;
}

const SlippageSettings = ({ slippage, setSlippage }: SlippageSettingsProps) => {
  return (
    <div className="p-2">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Slippage Tolerance</p>
      <Select value={slippage} onValueChange={setSlippage}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select slippage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5.0">5.0% (Default)</SelectItem>
          <SelectItem value="10.0">10.0%</SelectItem>
          <SelectItem value="20.0">20.0%</SelectItem>
          <SelectItem value="50.0">50.0%</SelectItem>
          <SelectItem value="75.0">75.0%</SelectItem>
          <SelectItem value="80.0">80.0%</SelectItem>
          <SelectItem value="90.0">90.0%</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SlippageSettings;
