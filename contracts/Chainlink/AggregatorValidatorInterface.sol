// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

interface AggregatorValidatorInterface {
	function validate(uint256 previousRoundId,
			int256 previousAnswer,
			uint256 currentRoundId,
			int256 currentAnswer) external returns (bool);
}