"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Copy, ExternalLink, LogOut, Wallet, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

interface WalletConnectProps {
  isConnected: boolean
  onConnect: (address: string) => void
  onDisconnect: () => void
}

export function WalletConnect({ isConnected, onConnect, onDisconnect }: WalletConnectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [address, setAddress] = useState<string>("")
  const [chainId, setChainId] = useState<string>("")

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== "undefined" && typeof window.ethereum !== "undefined"

  // Handle account changes
  useEffect(() => {
    if (isMetaMaskInstalled) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          onDisconnect()
          setAddress("")
        } else if (accounts[0] !== address) {
          // Account changed
          setAddress(accounts[0])
          onConnect(accounts[0])
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(chainId)
      }

      // Check if already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0])
            onConnect(accounts[0])

            // Get current chain ID
            window.ethereum.request({ method: "eth_chainId" }).then((chainId: string) => {
              setChainId(chainId)
            })
          }
        })
        .catch((err: any) => {
          console.error(err)
        })

      // Set up event listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      // Clean up event listeners
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [address, onConnect, onDisconnect, isMetaMaskInstalled])

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) {
      toast({
        title: "MetaMask not installed",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      })
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      setAddress(accounts[0])
      onConnect(accounts[0])
      setIsDialogOpen(false)

      // Get current chain ID
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      setChainId(chainId)
    } catch (error) {
      console.error(error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = () => {
    setAddress("")
    onDisconnect()
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const getChainName = (chainId: string) => {
    const chains: Record<string, string> = {
      "0x1": "Ethereum",
      "0x89": "Polygon",
      "0xa": "Optimism",
      "0xa4b1": "Arbitrum",
      "0x2105": "Base",
      "0x144": "zkSync Era",
    }
    return chains[chainId] || "Unknown Network"
  }

  const viewOnExplorer = () => {
    const explorers: Record<string, string> = {
      "0x1": "https://etherscan.io/address/",
      "0x89": "https://polygonscan.com/address/",
      "0xa": "https://optimistic.etherscan.io/address/",
      "0xa4b1": "https://arbiscan.io/address/",
      "0x2105": "https://basescan.org/address/",
      "0x144": "https://explorer.zksync.io/address/",
    }

    const baseUrl = explorers[chainId] || "https://etherscan.io/address/"
    window.open(`${baseUrl}${address}`, "_blank")
  }

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-[#0d1224] border-gray-700">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
              <span>{truncateAddress(address)}</span>
              <span className="text-xs text-gray-400">({getChainName(chainId)})</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#0d1224] border-gray-700">
          <DropdownMenuItem className="flex items-center gap-2" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
            <span>Copy Address</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2" onClick={viewOnExplorer}>
            <ExternalLink className="h-4 w-4" />
            <span>View on Explorer</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2 text-red-500" onClick={handleDisconnect}>
            <LogOut className="h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a2238] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription className="text-gray-400">
            Connect your wallet to bridge assets across chains
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center justify-between p-6 bg-[#0d1224] border-gray-700 hover:bg-[#0d1224]/80"
            onClick={handleConnect}
          >
            <span className="text-lg font-medium">MetaMask</span>
            <Image src="/placeholder.svg?height=40&width=40" alt="MetaMask" width={40} height={40} />
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-between p-6 bg-[#0d1224] border-gray-700 hover:bg-[#0d1224]/80"
            disabled
          >
            <span className="text-lg font-medium">WalletConnect</span>
            <Image src="/placeholder.svg?height=40&width=40" alt="WalletConnect" width={40} height={40} />
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-between p-6 bg-[#0d1224] border-gray-700 hover:bg-[#0d1224]/80"
            disabled
          >
            <span className="text-lg font-medium">Coinbase Wallet</span>
            <Image src="/placeholder.svg?height=40&width=40" alt="Coinbase Wallet" width={40} height={40} />
          </Button>
        </div>
        {!isMetaMaskInstalled && (
          <div className="text-yellow-400 text-sm mt-2">
            MetaMask is not installed. Please install MetaMask to connect your wallet.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
