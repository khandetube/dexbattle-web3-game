const $=s=>document.querySelector(s);

const walletBtn=$("#walletBtn");
const walletAddress=$("#walletAddress");
const walletBalance=$("#walletBalance");
const walletStatus=$("#walletStatus");
const txBtn=$("#txBtn");
const txStatus=$("#txStatus");
const txHash=$("#txHash");
const findBtn=$("#findBtn");
const matchState=$("#matchState");
const timer=$("#matchTimer");
const switchBtn=$("#switchBtn");
const networkPill=$("#networkPill");

const TARGET_CHAIN_ID=11155111; // Ethereum Sepolia
const CONTRACT_ADDRESS=""; // Intentionally empty: portfolio stays read-only until a reviewed testnet contract is configured.

let connected=false;
let seconds=161;
let account=null;
let provider=null;
let currentChainId=null;
let matchPhase="MATCH IN PROGRESS";

const shortAddress=a=>a?a.slice(0,6)+"…"+a.slice(-4):"Not connected";
const chainName=id=>({
  1:"Ethereum Mainnet",
  11155111:"Sepolia",
  137:"Polygon",
  8453:"Base",
  42161:"Arbitrum"
}[Number(id)]||"EVM network");

function setTx(status,message,tone="var(--cyan)"){
  if(txStatus){
    txStatus.textContent=status;
    txStatus.style.color=tone;
  }
  if(txHash)txHash.textContent=message;
}

async function refreshWalletData(){
  if(!provider||!account)return;
  try{
    const network=await provider.getNetwork();
    currentChainId=Number(network.chainId);
    const balance=await provider.getBalance(account);
    const name=chainName(currentChainId);

    walletBalance.textContent=ethers.formatEther(balance)+" ETH · "+name;
    networkPill.textContent=name.toUpperCase();

    if(currentChainId===TARGET_CHAIN_ID){
      networkPill.style.color="var(--green)";
      setTx("READY",CONTRACT_ADDRESS
        ?"Contract configured · "+shortAddress(CONTRACT_ADDRESS)
        :"Wallet connected · read-only testnet mode");
    }else{
      networkPill.style.color="var(--yellow)";
      setTx("NETWORK",name+" detected · switch to Sepolia for testnet validation","var(--yellow)");
    }
  }catch(e){
    walletBalance.textContent="Balance unavailable";
    setTx("RPC ERROR","Unable to read wallet/network data","var(--red)");
  }
}

function renderWallet(){
  walletBtn.textContent=connected?shortAddress(account):"Connect Wallet";
  walletAddress.textContent=connected?shortAddress(account):"Not connected";
  walletStatus.textContent=connected?"CONNECTED":"OFFLINE";
  walletStatus.style.color=connected?"var(--green)":"var(--muted)";
}

async function connectWallet(){
  if(!window.ethereum){
    walletStatus.textContent="DEMO MODE";
    walletAddress.textContent="No injected wallet detected";
    walletBalance.textContent="Install MetaMask / compatible wallet";
    setTx("DEMO","No wallet provider detected · UI simulation remains available");
    return false;
  }

  try{
    provider=new ethers.BrowserProvider(window.ethereum);
    const accounts=await window.ethereum.request({method:"eth_requestAccounts"});
    account=accounts[0]||null;
    connected=!!account;
    renderWallet();
    await refreshWalletData();
    return connected;
  }catch(e){
    setTx("CANCELLED",e?.code===4001
      ?"Wallet connection was cancelled"
      :"Wallet connection failed","var(--red)");
    return false;
  }
}

walletBtn?.addEventListener("click",connectWallet);

window.ethereum?.on?.("accountsChanged",async accounts=>{
  account=accounts[0]||null;
  connected=!!account;
  provider=connected?new ethers.BrowserProvider(window.ethereum):null;
  renderWallet();

  if(connected){
    await refreshWalletData();
  }else{
    walletBalance.textContent="Balance —";
    networkPill.textContent="TESTNET";
    setTx("IDLE","Waiting for wallet connection");
  }
});

window.ethereum?.on?.("chainChanged",async()=>{
  provider=window.ethereum?new ethers.BrowserProvider(window.ethereum):null;
  setTx("NETWORK","Network changed · refreshing wallet data");
  if(connected)await refreshWalletData();
});

findBtn?.addEventListener("click",()=>{
  matchPhase="MATCH FOUND · QUEUE LOCKED";
  matchState.textContent=matchPhase;
  findBtn.innerHTML="Match found ✓";
  findBtn.disabled=true;
  document.querySelector("#arena")?.scrollIntoView({behavior:"smooth"});

  setTimeout(()=>{
    matchPhase="MATCH IN PROGRESS";
    matchState.textContent=matchPhase;
    findBtn.innerHTML="Find another ranked match <span>→</span>";
    findBtn.disabled=false;
  },4500);
});

switchBtn?.addEventListener("click",async()=>{
  if(!window.ethereum){
    switchBtn.textContent="EVM simulation selected ✓";
  }else{
    try{
      await window.ethereum.request({
        method:"wallet_switchEthereumChain",
        params:[{chainId:"0xaa36a7"}]
      });
      switchBtn.textContent="Sepolia selected ✓";
      if(connected)await refreshWalletData();
    }catch(e){
      switchBtn.textContent=e?.code===4001
        ?"Switch cancelled"
        :"Switch unavailable";
      setTx("NETWORK","Could not switch network","var(--yellow)");
    }
  }
  setTimeout(()=>switchBtn.textContent="Switch network",1800);
});

txBtn?.addEventListener("click",async()=>{
  if(!connected){
    const ok=await connectWallet();
    if(!ok)return;
  }

  txBtn.disabled=true;
  txBtn.textContent="Checking wallet…";
  setTx("READY","Validating wallet and network");

  try{
    await refreshWalletData();
    const network=await provider.getNetwork();

    if(Number(network.chainId)!==TARGET_CHAIN_ID){
      setTx("NETWORK","Switch to Sepolia before testnet validation","var(--yellow)");
      txBtn.textContent="Network required";
      return;
    }

    // No payment is requested by this portfolio demo.
    if(!CONTRACT_ADDRESS){
      setTx("READ-ONLY","No contract configured · no signature or funds requested");
      txBtn.textContent="Read-only check ✓";
    }else{
      setTx("CONFIGURED","Contract "+shortAddress(CONTRACT_ADDRESS)+" · chain "+network.chainId);
      txBtn.textContent="Contract check ✓";
    }
  }catch(e){
    setTx("ERROR","Web3 read failed · "+(e?.shortMessage||e?.message||"unknown error"),"var(--red)");
    txBtn.textContent="Check failed";
  }finally{
    setTimeout(()=>{
      txBtn.disabled=false;
      txBtn.textContent="Simulate entry transaction";
    },1700);
  }
});

setInterval(()=>{
  seconds=seconds<=0?161:seconds-1;
  timer.textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");
},1000);

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting)e.target.classList.add("visible");
}),{threshold:.12});

document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
renderWallet();
