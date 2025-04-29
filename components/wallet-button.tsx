"use client"
import Header from '@/components/connect-button';

import { useState, createContext } from 'react';

//@ts-ignore
const pubKeyData = createContext();

export default function Cnw() {
  const [pubkey, _setPubKey] = useState("");
  
  return (
    <div className="App">
      <Header setPubKey={_setPubKey} />
      <pubKeyData.Provider value={pubkey}>
        <div className="flex gap-10 flex-wrap justify-center">
          <div>
          
          </div>
          <div>
          
          </div>
        </div>
      </pubKeyData.Provider>
    </div>
  );
}

export { pubKeyData };