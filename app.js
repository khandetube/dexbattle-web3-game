const $=s=>document.querySelector(s);
const walletBtn=$("#walletBtn"),walletAddress=$("#walletAddress"),walletBalance=$("#walletBalance"),walletStatus=$("#walletStatus"),
txBtn=$("#txBtn"),txStatus=$("#txStatus"),txHash=$("#txHash"),findBtn=$("#findBtn"),
matchState=$("#matchState"),timer=$("#matchTimer"),switchBtn=$("#switchBtn");

const TARGET_CHAIN_ID=11155111; // Ethereum Sepolia
const CONTRACT_ADDRESS=""; // Set after deploying DexBattleEscrow to a testnet
let connected=false,seconds=161,account=null,provider=null;

const shortAddress=a=>a?a.slice(0,6)+"…"+a.slice(-4):"Not connected";
const chainName=id=>({1:"Ethereum Mainnet",11155111:"Sepolia",137:"Polygon",8453:"Base",42161:"Arbitrum"}[Number(id)]||"EVM network");

async function refreshWalletData(){
  if(!provider||!account)return;
  try{
    const network=await provider.getNetwork();
    const balance=await provider.getBalance(account);
    walletBalance.textContent=ethers.formatEther(balance)+" ETH · "+chainName(network.chainId);
    txHash.textContent=CONTRACT_ADDRESS?"Contract configured · "+shortAddress(CONTRACT_ADDRESS):"Wallet connected · read-only Web3 mode";
    $("#networkPill").textContent=chainName(network.chainId).toUpperCase();
  }catch(e){
    walletBalance.textContent="Balance unavailable";
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
    txStatus.textContent="CANCELLED";
    txHash.textContent=e?.code===4001?"Wallet connection was cancelled":"Wallet connection failed";
    return false;
  }
}

walletBtn?.addEventListener("click",connectWallet);

window.ethereum?.on?.("accountsChanged",async accounts=>{
  account=accounts[0]||null;
  connected=!!account;
  provider=connected?new ethers.BrowserProvider(window.ethereum):null;
  renderWallet();
  if(connected)await refreshWalletData();
  else walletBalance.textContent="Balance —";
});

window.ethereum?.on?.("chainChanged",async()=>{
  provider=window.ethereum?new ethers.BrowserProvider(window.ethereum):null;
  txHash.textContent="Network changed · refreshing wallet data";
  await refreshWalletData();
});

findBtn?.addEventListener("click",()=>{
  matchState.textContent="MATCH FOUND · QUEUE LOCKED";
  findBtn.innerHTML="Match found ✓";
  document.querySelector("#arena")?.scrollIntoView({behavior:"smooth"});
});

switchBtn?.addEventListener("click",async()=>{
  if(!window.ethereum){
    switchBtn.textContent="EVM simulation selected ✓";
  }else{
    try{
      await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:"0xaa36a7"}]});
      switchBtn.textContent="Sepolia selected ✓";
      await refreshWalletData();
    }catch(e){
      switchBtn.textContent=e?.code===4001?"Switch cancelled":"Switch unavailable";
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
  txBtn.textContent="Reading wallet…";
  txStatus.textContent="READY";
  txStatus.style.color="var(--cyan)";
  try{
    await refreshWalletData();
    const network=await provider.getNetwork();
    txBtn.textContent="Checking contract…";
    if(!CONTRACT_ADDRESS){
      txStatus.textContent="READ-ONLY";
      txStatus.style.color="var(--cyan)";
      txHash.textContent="No contract address configured · no funds requested";
      await new Promise(r=>setTimeout(r,900));
      txBtn.textContent="Wallet check complete ✓";
    }else{
      txStatus.textContent="CONFIGURED";
      txHash.textContent="Contract "+shortAddress(CONTRACT_ADDRESS)+" · chain "+network.chainId;
      await new Promise(r=>setTimeout(r,900));
      txBtn.textContent="Contract ready ✓";
    }
  }catch(e){
    txStatus.textContent="ERROR";
    txStatus.style.color="var(--red)";
    txHash.textContent="Web3 read failed";
  }
  setTimeout(()=>{txBtn.disabled=false;txBtn.textContent="Check Web3 wallet"},1700);
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
