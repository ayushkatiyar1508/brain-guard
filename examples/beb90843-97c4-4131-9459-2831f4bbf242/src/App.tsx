import React, { useState } from 'react';
import { Dog, RefreshCw, Share2 } from 'lucide-react';

function calculateDogAge(age: number): number {
  if (age <= 2) {
    return age * 10.5;
  }
  return 21 + (age - 2) * 4;
}

function App() {
  const [dogAge, setDogAge] = useState<string>('');
  const [humanAge, setHumanAge] = useState<number | null>(null);

  const handleCalculate = () => {
    const age = parseFloat(dogAge);
    if (!isNaN(age) && age > 0) {
      setHumanAge(calculateDogAge(age));
    }
  };

  const handleReset = () => {
    setDogAge('');
    setHumanAge(null);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=2969&ixlib=rb-4.0.3')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <Dog className="w-10 h-10 text-amber-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">狗狗年龄计算器</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="dogAge" className="block text-sm font-medium text-gray-700 mb-2">
              请输入狗狗的年龄（岁）
            </label>
            <input
              type="number"
              id="dogAge"
              value={dogAge}
              onChange={(e) => setDogAge(e.target.value)}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="例如：2.5"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              计算年龄
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="重置"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {humanAge !== null && (
            <div className="mt-6 p-6 bg-amber-50 rounded-lg">
              <h2 className="text-2xl font-bold text-amber-800 mb-2">
                相当于 {humanAge.toFixed(1)} 岁的人类年龄
              </h2>
              <p className="text-amber-700">
                您的狗狗相当于 {humanAge.toFixed(1)} 岁的人类年龄！
              </p>
              <button
                className="mt-4 flex items-center text-sm text-amber-600 hover:text-amber-800"
              >
                <Share2 className="w-4 h-4 mr-1" />
                分享结果
              </button>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p>计算方法说明：</p>
            <ul className="list-disc list-inside">
              <li>前2年：每年相当于10.5个人类年龄</li>
              <li>2年后：每年相当于4个人类年龄</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;