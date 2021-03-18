import { formatUnits } from '@ethersproject/units';
import Multicaller from '../../utils/multicaller';

export const author = 'bonustrack';
export const version = '0.2.0';

const abi = [
  {
    inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
    name: 'isEmployeeMember',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'stakes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export async function strategy(
  space,
  network,
  provider,
  addresses,
  options,
  snapshot
) {
  const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
  const multi = new Multicaller(network, provider, abi, { blockTag });
  addresses.forEach((address) => {
    multi.call(`${address}.isEmployeeMember`, options.whitelist, 'isEmployeeMember', [
      address
    ]);
    multi.call(`${address}.stake`, options.stake, 'stakes', [address]);
  });
  const result = await multi.execute();
  return Object.fromEntries(
    addresses.map((address) => {
      const stake = parseFloat(
        formatUnits(result[address].stake.toString(), options.decimals)
      );
      return [address, result[address].isEmployeeMember ? Math.sqrt(stake) + 1 : 0];
    })
  );
}
