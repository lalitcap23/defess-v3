// "use client"

// import React, { useEffect, useState } from "react";
// import { checkConnection, retrievePublicKey } from "./freighter";
// //import { addtoDb } from "@/actions/user";
// //import { fetchFeedback } from "./SmartContractInteraction";

// export const Header = ({ setPubKey  } : {setPubKey : React.Dispatch<React.SetStateAction<string | undefined>>}) => {
//   const [connect, getConnected] = useState("Connect");
//   const [publickey, getPublicKey] = useState();
//   const [open, setOpen] = useState(false);

//   const handleOpenMenu = () => setOpen(!open);

//   useEffect(() => {
//     if (publickey !== "") {
//       getConnected("Connected!");
//       setPubKey(publickey);
//      // fetchFeedback(publickey, 1);
//     }
//   }, [publickey]);

//   const connectWallet = async () => {
//     if (await checkConnection()) {
//       const key = await retrievePublicKey() as string
//       console.log(key)
//       //@ts-ignore
//       getPublicKey(key.address);

//       //@ts-ignore
//     //   const res = await addtoDb(key.address);

//     //   if(!res || res.status == 400) {
//     //     alert(res?.msg)
//     //   } else {
//     //     alert(res.msg)
//     //   }
//     // }
//   };

//   // Format the public key with ellipsis in the middle
//   const formatPublicKey = () => {
//     //@ts-ignore
//     if (!publickey || publickey.length === 0) {
//     console.log("error 1")
//       return "";
//     }
//     //@ts-ignore
//     if (publickey.length <= 8) {
//       return publickey;
//     }
//     //@ts-ignore
//     return `${publickey.substring(0, 4)}...${publickey.substring(publickey.length - 4)}`;
//   };

//   return (<div className="flex justify-end items-center gap-4 p-3">
//     {publickey && (
//       <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex items-center border border-gray-200">
//         <span className="text-gray-600 font-medium mr-2">Address:</span>
//         <span className="text-gray-800 truncate max-w-[140px]">{formatPublicKey()}</span>
//       </div>
//     )}
    
//     <button
//       className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
//       onClick={connectWallet}
//     >
//       {connect}
//     </button>
//   </div>
//   );
// };