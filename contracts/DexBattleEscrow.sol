// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract DexBattleEscrow {
    error NotOwner(); error InvalidMatch(); error NotPlayer(); error AlreadyJoined(); error AlreadySettled(); error IncorrectEntry(); error TransferFailed(); error Reentrancy();
    address public immutable owner; uint256 private _lock=1; uint256 public immutable entryFee;
    struct Match { address playerA; address playerB; uint256 pot; bool settled; }
    mapping(bytes32=>Match) public matches; mapping(address=>uint256) public credits;
    event MatchCreated(bytes32 indexed matchId,address indexed playerA); event MatchJoined(bytes32 indexed matchId,address indexed playerB); event MatchSettled(bytes32 indexed matchId,address indexed winner,uint256 reward); event Withdrawn(address indexed player,uint256 amount);
    modifier onlyOwner(){if(msg.sender!=owner)revert NotOwner();_;} modifier nonReentrant(){if(_lock!=1)revert Reentrancy();_lock=2;_;_lock=1;}
    constructor(uint256 _entryFee){owner=msg.sender;entryFee=_entryFee;}
    function createMatch(bytes32 matchId) external payable {if(msg.value!=entryFee||matches[matchId].playerA!=address(0))revert IncorrectEntry();matches[matchId]=Match(msg.sender,address(0),msg.value,false);emit MatchCreated(matchId,msg.sender);}
    function joinMatch(bytes32 matchId) external payable {Match storage m=matches[matchId];if(m.playerA==address(0)||m.playerB!=address(0)||m.settled)revert InvalidMatch();if(msg.sender==m.playerA)revert AlreadyJoined();if(msg.value!=entryFee)revert IncorrectEntry();m.playerB=msg.sender;m.pot+=msg.value;emit MatchJoined(matchId,msg.sender);}
    function settle(bytes32 matchId,address winner) external onlyOwner {Match storage m=matches[matchId];if(m.playerA==address(0)||m.playerB==address(0))revert InvalidMatch();if(m.settled)revert AlreadySettled();if(winner!=m.playerA&&winner!=m.playerB)revert NotPlayer();m.settled=true;credits[winner]+=m.pot;emit MatchSettled(matchId,winner,m.pot);}
    function withdraw() external nonReentrant {uint256 amount=credits[msg.sender];if(amount==0)revert TransferFailed();credits[msg.sender]=0;(bool ok,)=payable(msg.sender).call{value:amount}("");if(!ok)revert TransferFailed();emit Withdrawn(msg.sender,amount);}
    receive() external payable {}
}