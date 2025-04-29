import {
    requestAccess,
    signTransaction,
    setAllowed,
  } from "@stellar/freighter-api";
  
  async function checkConnection() {
    const isAllowed = await setAllowed();
    if (isAllowed) {
      return isAllowed;
    }
  }
  //@ts-ignore
  const retrievePublicKey = async () => {
    let publicKey = "";
    let error = "";
    try {
        //@ts-ignore
      publicKey  = await requestAccess()
    } catch (e : any) {
      error = e;
    }
    if (error) {
      return error;
    }
    return publicKey;
  };
  
  const userSignTransaction = async (xdr : any, network :  any, signWith : any) => {
    let signedTransaction = "";
    let error = "";
  
    try {
        //@ts-ignore
      signedTransaction = await signTransaction(xdr, {
        //@ts-ignore
        network,
        accountToSign: signWith,
      });
    } catch (e: any) {
      error = e;
    }
  
    if (error) {
      return error;
    }
  
    return signedTransaction;
  };
  
  export { checkConnection, retrievePublicKey, userSignTransaction };