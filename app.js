const $=s=>document.querySelector(s);
const walletBtn=$("#walletBtn"),walletAddress=$("#walletAddress"),walletStatus=$("#walletStatus"),
txBtn=$("#txBtn"),txStatus=$("#txStatus"),txHash=$("#txHash"),findBtn=$("#findBtn"),
matchState=$("#matchState"),timer=$("#matchTimer"),switchBtn=$("#switchBtn");
let connected=false,seconds=161,account=null;

const shortAddress=a=>a?a.slice(0,6)+"…"+a.slice(-4):"Not connected";
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
    return;
  }
  try{
    const accounts=await window.ethereum.request({method:"eth_requestAccounts"});
    account=accounts[0]; connected=!!account; renderWallet();
    txHash.textContent="Wallet connected · ready for transaction";
  }catch(e){
    txStatus.textContent="CANCELLED";
    txHash.textContent="Wallet connection was cancelled";
  }
}
walletBtn?.addEventListener("click",connectWallet);

window.ethereum?.on?.("accountsChanged",accounts=>{
  account=accounts[0]||null; connected=!!account; renderWallet();
});
window.ethereum?.on?.("chainChanged",()=>{txHash.textContent="Network changed · interface refreshed";});

findBtn?.addEventListener("click",()=>{
  matchState.textContent="MATCH FOUND · QUEUE LOCKED";
  findBtn.innerHTML="Match found ✓";
  document.querySelector("#arena")?.scrollIntoView({behavior:"smooth"});
});

switchBtn?.addEventListener("click",async()=>{
  if(window.ethereum){
    try{
      const chainId=await window.ethereum.request({method:"eth_chainId"});
      switchBtn.textContent=chainId==="0x1"?"Ethereum Mainnet detected ✓":"EVM network detected ✓";
    }catch(e){switchBtn.textContent="Network check failed";}
  }else switchBtn.textContent="EVM simulation selected ✓";
  setTimeout(()=>switchBtn.textContent="Switch network",1600);
});

txBtn?.addEventListener("click",async()=>{
  if(!connected) await connectWallet();
  txBtn.disabled=true;
  txBtn.textContent="Awaiting signature…";
  txStatus.textContent="SIGNING";
  txStatus.style.color="var(--cyan)";
  if(window.ethereum && account){
    try{
      const chainId=await window.ethereum.request({method:"eth_chainId"});
      txHash.textContent="Wallet ready · chain "+parseInt(chainId,16);
      await new Promise(r=>setTimeout(r,700));
    }catch(e){
      txStatus.textContent="REJECTED";
      txStatus.style.color="var(--red)";
      txHash.textContent="Transaction request rejected";
      txBtn.disabled=false; txBtn.textContent="Simulate entry transaction"; return;
    }
  }else await new Promise(r=>setTimeout(r,700));
  txBtn.textContent="Broadcasting…";
  txStatus.textContent="PENDING";
  txHash.textContent=window.ethereum&&account?"Signature accepted · awaiting contract confirmation":"0x9f3a…7c21 · demo confirmation";
  await new Promise(r=>setTimeout(r,1100));
  txBtn.textContent="Transaction confirmed ✓";
  txStatus.textContent="CONFIRMED";
  txStatus.style.color="var(--green)";
  txHash.textContent=window.ethereum&&account?"Wallet transaction flow completed":"0x9f3a…7c21 · simulated block confirmation";
  setTimeout(()=>{txBtn.disabled=false;txBtn.textContent="Simulate entry transaction"},1700);
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