> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# LI.FI Widget Overview

> Cross-chain and on-chain swap and bridging UI toolkit

LI.FI Widget is a set of prebuilt UI components that will help you integrate a secure cross-chain bridging and swapping experience that can be styled to match your web app design perfectly and helps drive your multi-chain strategy and attract new users from everywhere.

**LI.FI Widget features include:**

* All ecosystems, chains, bridges, exchanges, and solvers that LI.FI supports
* Embeddable variants - compact, wide, and drawer
* Options to allow or deny certain chains, tokens, bridges, and exchanges
* Pre-configured themes and lots of customization options with dark mode support so you can match the look and feel of your web app
* Supports widely adopted industry standards, including [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792), [ERC-2612](https://eips.ethereum.org/EIPS/eip-2612), [EIP-712](https://eips.ethereum.org/EIPS/eip-712), and [Permit2](https://github.com/Uniswap/permit2)
* SDK ecosystem providers are based on industry-standard libraries ([Viem](https://viem.sh/), [Wallet Standard](https://github.com/wallet-standard/wallet-standard), [Bigmi](https://github.com/wallet-standard/wallet-standard))
* View of transactions in progress and transaction history
* Curated wallet lists and wallet bookmarks
* Route settings for advanced users (stored locally)
* Complete UI translations to match your customer’s preferred language
* Compatibility tested with React, Next.js, Vue, Nuxt.js, Svelte, Remix, Gatsby, Vite, CRA, RainbowKit

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Install Widget

> Easy installation to go multi-chain

To get started, install the latest version of LI.FI Widget.

<CodeGroup>
  ```typescript yarn theme={"system"}
  yarn add @lifi/widget wagmi@2 @bigmi/react @solana/wallet-adapter-react @mysten/dapp-kit @tanstack/react-query
  ```

  ```typescript pnpm theme={"system"}
  pnpm add @lifi/widget wagmi@2 @bigmi/react @solana/wallet-adapter-react @mysten/dapp-kit @tanstack/react-query
  ```

  ```typescript bun theme={"system"}
  bun add @lifi/widget wagmi@2 @bigmi/react @solana/wallet-adapter-react @mysten/dapp-kit @tanstack/react-query
  ```

  ```typescript npm theme={"system"}
  npm install @lifi/widget wagmi@2 @bigmi/react @solana/wallet-adapter-react @mysten/dapp-kit @tanstack/react-query
  ```
</CodeGroup>

[Wagmi](https://wagmi.sh/) is type safe, extensible, and modular library for building Ethereum apps.

[Bigmi](https://github.com/lifinance/bigmi) is modular TypeScript library that provides reactive primitives for building Bitcoin applications.

[@solana/wallet-adapter-react](https://github.com/anza-xyz/wallet-adapter) is modular TypeScript wallet adapters and components for Solana applications.

[@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit) provides React tools for wallet integration and data access in Sui blockchain dApps.

[TanStack Query](https://tanstack.com/query/v5) is an async state manager that handles requests, caching, and more.

## Compatibility

List of environments, libraries and frameworks we've tested the widget with so far:

* React 18+ ([Example](https://github.com/lifinance/widget/tree/main/examples/create-react-app))

* Vite ([Example](https://github.com/lifinance/widget/tree/main/examples/vite))

* Next.js ([Compatibility with Next.js, Remix, Nuxt, etc.](/widget/compatibility), [example](https://github.com/lifinance/widget/tree/main/examples/nextjs))

* Remix ([Example](https://github.com/lifinance/widget/tree/main/examples/remix))

* Vue 3 ([Example](https://github.com/lifinance/widget/tree/main/examples/vue))

* Svelte ([Example](https://github.com/lifinance/widget/tree/main/examples/svelte))

* Nuxt.js ([Example](https://github.com/lifinance/widget/tree/main/examples/nuxt))

* Gatsby ([Example](https://github.com/lifinance/widget/tree/main/examples/gatsby))

* RainbowKit ([Example](https://github.com/lifinance/widget/tree/main/examples/rainbowkit))

See the compatibility pages for more information.

Check out our complete examples in the [widget repository](https://github.com/lifinance/widget/tree/main/examples) or [file an issue](https://github.com/lifinance/widget/issues) if you have any incompatibilities.

<Note>
  Check out our [LI.FI Playground](https://playground.li.fi/) to play with customization options in
  real time.
</Note>

## Basic example

Here is a basic example using LI.FI Widget with container customization.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'

const widgetConfig: WidgetConfig = {
  theme: {
    container: {
      border: '1px solid rgb(234, 234, 234)',
      borderRadius: '16px',
    },
  },
}

export const WidgetPage = () => {
  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Select Widget Variants

> Customize your experience with our versatile variants

LI.FI Widget comes in three variants - `compact`, `wide`, and `drawer`. Variants allow customization of the exterior of the widget, like the side panel for quotes or drawer. There are also several subvariants - `default`, `split`, and `custom`. They help to customize the interior look and feel as well as functionality.

## Variants

Variants provide a way to optimize the presentational style of the Widget for the space available in your application.

<Note>
  Check out our [LI.FI Playground](https://playground.li.fi/) to play with variants.
</Note>

To use one of the variants, set the `variant` option in the configuration.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
  // It can be either compact, wide, or drawer
  variant: 'wide',
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

## Compact variant

The compact variant is a great choice when you have limited space on a page or are dealing with smaller screen sizes. It has everything you need to bridge and swap in a compact view and allows you to integrate the widget wherever you want on your web app's page.
<img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact_variant.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=cc9934ab188eb5d86e68080eb6fddaa9" alt="Compact variant" data-og-width="906" width="906" data-og-height="1422" height="1422" data-path="images/widget-variants/compact_variant.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact_variant.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=196db4216767a04be06fdf58b9155cbe 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact_variant.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bffce51a478e7bc4e86c40cd70d4657c 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact_variant.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=cc5230301109b22ecd54c27cc3b6cda2 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact_variant.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=36803b83a220a4f1c9edffa25d802a85 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact_variant.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=83d2a7047eb0c6e6d1e76e16565342d7 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact_variant.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=e6a9d00d55a2b2b458ab7e1ad89648b8 2500w" />

## Wide variant

The wide variant allows you to take advantage of bigger page and screen sizes where you might have more available screen real estate and provides a more comprehensive overview of available routes, displayed in a sidebar with slick animation.
<img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/wide_variant.gif?s=fc1152216b270848bb119a5a7631a865" alt="Wide variant" data-og-width="814" width="814" data-og-height="646" height="646" data-path="images/widget-variants/wide_variant.gif" data-optimize="true" data-opv="3" />

## Drawer variant

The drawer variant allows you to show or hide the Widget based on user interaction. It can fit nicely on the page's side and has the same layout as the compact variant.
<img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/drawer_variant.gif?s=8c9cbd2fbbc68d37d5b2affbb8e9c526" alt="Drawer variant" data-og-width="768" width="768" data-og-height="1177" height="1177" data-path="images/widget-variants/drawer_variant.gif" data-optimize="true" data-opv="3" />

## How do we control the drawer?

The drawer doesn't have a pre-built button to open and close it. To control the drawer you need to create and assign a `ref` to the widget.

Here is an example of controlling the drawer with `ref`:

```typescript  theme={"system"}
export const WidgetPage = () => {
  const drawerRef = useRef<WidgetDrawer>(null);

  const toggleWidget = () => {
    drawerRef.current?.toggleDrawer();
  };

  return (
    <div>
      <button onClick={toggleWidget}>Open LI.FI Widget</button>
      <LiFiWidget
        ref={drawerRef}
        config={{
          variant: 'drawer',
        }}
        integrator="drawer-example"
      />
    </div>
  );
}
```

## Subvariants

Subvariants allow you to present different workflows for your users.

The **default** subvariant has the same functionality to bridge and swap in a compact view.

The **split** subvariant separates mental models and has slightly different views for bridging and swapping experiences with neat tabs on the main page.

The **custom** subvariant offers a totally new look, allowing you to show custom components like the NFT one and giving you a toolkit to build complete new flows, including NFT Checkout and Deposit.

<Columns cols={2}>
  <Card title="Default subvariant" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/default-subvariant.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a443f6a38b926ca08dbfeffc0722f8cd" data-og-width="422" width="422" data-og-height="661" height="661" data-path="images/widget-variants/default-subvariant.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/default-subvariant.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=c10e4d71d70753f9850de61784bb08e9 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/default-subvariant.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bcb2c6ca5404a6bf2fef6b8b70cf51c9 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/default-subvariant.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bb21fc66eefcd41b4535da4e5b82b9c1 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/default-subvariant.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=78ac8bc5dc754048bbbc95cc9bffcd03 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/default-subvariant.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6d5e542b9e754825435ec559cab2ee79 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/default-subvariant.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=eb04473ee87d2596a7d86e1b8890579d 2500w" />

  <Card title="Custom subvariant (NFT Checkout)" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/nft_checkout.avif?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=645eafefba8a7ab423e0b8f0f98d89a1" data-og-width="768" width="768" data-og-height="1221" height="1221" data-path="images/widget-variants/nft_checkout.avif" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/nft_checkout.avif?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f86c7a6b9338d4f7c51c2748d0aecb0a 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/nft_checkout.avif?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=34c25ced786ce6a55f32a8910d440a22 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/nft_checkout.avif?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a1d0716dfee12a1892a184c0a64ee0af 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/nft_checkout.avif?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=b87786870eae2a9124b87cc97ff636aa 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/nft_checkout.avif?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d878e1ddd191632cea5632df0fc8431d 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/nft_checkout.avif?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=5c635ecc539095d2eb57db8ca5538a82 2500w" />
</Columns>

See [Split subvariant options](#split-subvariant-options) for configuration details of **split** subvariant.

To use one of the subvariants, set the `subvariant` option in the configuration.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
  // It can be either compact, wide, or drawer
  variant: 'wide',
  // It can be either default, split, or custom
  subvariant: 'split',
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

### Enabling the chain sidebar

If you're using the `wide` variant and want to have a chain sidebar instead of the compact chain selector, set `enableChainSidebar` to `true` in `subvariantOptions`:

```typescript  theme={"system"}
subvariantOptions: {
  wide: {
    enableChainSidebar: true,
  }
}
```

<div style={{ display: 'grid', gridTemplateColumns: '1.615fr 1fr', gap: '1rem' }}>
  <Card title="enableChainSidebar: true" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/chain-sidebar.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=0a0d133833f0dd9a571f816867c3448a" data-og-width="1458" width="1458" data-og-height="1402" height="1402" data-path="images/widget-variants/chain-sidebar.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/chain-sidebar.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=50245ca443be58ec5ac0bb4ff31cdedb 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/chain-sidebar.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=3f2daeb0d9678dafda3ce377cb303f94 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/chain-sidebar.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bb7a99ce2b73414e8596a55c5f1b0579 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/chain-sidebar.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=3c92ef0b38f92a4232096a79df5f5122 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/chain-sidebar.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=376d73401115eaadda05e3c3c300eec6 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/chain-sidebar.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=acbad2ffbe48c51cb9c449ce253bca6d 2500w" />

  <Card title="enableChainSidebar: false" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact-chain-selector.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=188f3e32a00c4e9198ac128cbe7cf933" data-og-width="900" width="900" data-og-height="1402" height="1402" data-path="images/widget-variants/compact-chain-selector.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact-chain-selector.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=89adb553a3b89370fec8adb347aa833f 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact-chain-selector.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=814216057cce26f0ca6a4635c58667ab 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact-chain-selector.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6357d0ea97e039ae8bb4c0ce140b2602 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact-chain-selector.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=abce9513dc0cdd0b480cb622bf1558a5 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact-chain-selector.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=85d7e5a968165dfaa3a86b34471cdfc2 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/compact-chain-selector.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bf3c18325163cfb7bfbf50ee8ae421f4 2500w" />
</div>

The chain sidebar in the `wide` variant is disabled by default.

### Split subvariant options

For `subvariant: 'split'`, the `subvariantOptions` configuration controls whether to show both "Swap" and "Bridge" tabs or a single interface.

* **Default (no options)**: Shows both "Bridge" and "Swap" tabs
* **`split: 'bridge'`**: Shows only bridge interface (no tabs)
* **`split: 'swap'`**: Shows only swap interface (no tabs)

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

// Default - shows tabs
const widgetConfig: WidgetConfig = {
  subvariant: 'split',
};

// Pure bridge interface
const bridgeConfig: WidgetConfig = {
  subvariant: 'split',
  subvariantOptions: {
    split: 'bridge'
  }
};

// Pure swap interface
const swapConfig: WidgetConfig = {
  subvariant: 'split',
  subvariantOptions: {
    split: 'swap'
  }
};
```

<Columns cols={2}>
  <Card title="Split subvariant (Default)" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/split-subvariant.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=0605060dbe054ed4801bf1539dad5017" data-og-width="452" width="452" data-og-height="682" height="682" data-path="images/widget-variants/split-subvariant.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/split-subvariant.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=938fd75fc05fb79296a592e75757e5ca 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/split-subvariant.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=c7b1e64ee1fefbbd242f36c81051bcab 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/split-subvariant.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=7f2e1cc9a59baf65beaaa98d79d75afb 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/split-subvariant.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=84d3c387d1bed5b51e2b0080914c2bd4 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/split-subvariant.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=ba74296da09fd9b0616cedaa8254e523 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/split-subvariant.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2c14590dbbf7c06a6c23ae3439fe15ca 2500w" />

  <Card title="Split subvariant (Swap option)" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/swap-subvariant.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=0c751e92cdb5e6b16c295c13a03cfd1c" data-og-width="452" width="452" data-og-height="682" height="682" data-path="images/widget-variants/swap-subvariant.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/swap-subvariant.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=c6df492b11e01554a07806ffb2d35b2e 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/swap-subvariant.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6b2b1b1ee8b8294dd0054f39573090bb 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/swap-subvariant.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=af1448c811068a5f601052419849589c 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/swap-subvariant.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4a215bc97304df9c2c7e7339ee274536 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/swap-subvariant.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=87f81af5a05b83d88428c4f74c5d9d91 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/widget-variants/swap-subvariant.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=7d34a73673de37311ac91a1cd6f8007e 2500w" />
</Columns>

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Configure Widget

> Flexibility at your fingertips

The LI.FI Widget supports a range of configuration options, allowing you to:

* Allow or deny specific chains, tokens, bridges, and exchanges.

* Preselect default source and destination chains.

* Choose default tokens for both source and destination.

* Set the amount of the destination token.

* Specify a destination address.

* Customize various LI.FI SDK settings through the `sdkConfig` configuration.

These options enable precise control over the widget's behavior and improve the user experience by adjusting it to specific needs and preferences.

## LI.FI SDK configuration

The LI.FI Widget is built on top of the LI.FI SDK, leveraging its robust functionality for cross-chain swaps and bridging. The sdkConfig option allows you to configure various aspects of the SDK directly within the widget.

Let's look at the example of configuring private RPC endpoints using the sdkConfig option.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig, ChainId } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  sdkConfig: {
    rpcUrls: {
      [ChainId.ARB]: ["https://arbitrum-example.node.com/"],
      [ChainId.SOL]: ["https://solana-example.node.com/"],
    },
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

<Warning>
  In a production app, it is recommended to pass through your authenticated RPC provider URL (Alchemy, Infura, Ankr, etc).

  If no RPC URLs are provided, LI.FI Widget will default to public RPC providers.

  Public RPC endpoints (especially Solana) can sometimes rate-limit users depending on location or during periods of heavy load, leading to issues such as incorrectly displaying balances or errors with transaction simulation.
</Warning>

Please see other SDK configuration options in the [Configure SDK](/sdk/configure-sdk) section.

## Initialize form values

The LI.FI Widget uses a number of form values that are used to fetch and execute routes.

These values are `fromAmount`, `fromChain`, `fromToken`, `toChain`, `toToken` and `toAddress`.

They are most often set by using the Widget UI but they can also be initialized and updated programmatically.

By configuring these options, you can streamline the user experience, ensuring that the widget is preloaded with the desired chains, tokens, amount and address for a swap or bridge. This reduces the need for manual input and helps guide users through the intended flow.

You can initialize these values by either:

* Widget config - by adding `fromAmount`, `fromChain`, `fromToken`, `toChain`, `toToken` or `toAddress` values to the widget config.

* URL search params - when `buildUrl` in the widget config is set to `true`, by adding them to the URL search params in the url of the page the widget is featured on.

When setting form values via config or URL search params you will see any corresponding form field UI updated to reflect those values.

## Initializing by widget config

The LI.FI Widget allows you to preconfigure default chains and tokens, making it easy to set up your desired swap or bridging parameters right from the start. Below is an example of how to configure the widget with specific default chains, tokens, amount, and send to address values.

```typescript  theme={"system"}
import type { WidgetConfig } from "@lifi/widget";
import { ChainType } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  // set source chain to Polygon
  fromChain: 137,
  // set destination chain to Optimism
  toChain: 10,
  // set source token to USDC (Polygon)
  fromToken: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  // set source token to USDC (Optimism)
  toToken: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  // set source token amount to 10 USDC (Polygon)
  fromAmount: 10,
  // set the destination wallet address
  toAddress: {
    address: "0x29DaCdF7cCaDf4eE67c923b4C22255A4B2494eD7",
    chainType: ChainType.EVM,
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

You can also set a minimum amount in USD equivalent using the `minFromAmountUSD` parameter (number) to ensure users meet minimum transaction requirements.

## Initializing by URL search params

To initialize form values in the widget using URL search params you will need to ensure that `buildUrl` is set to `true` in the widget config.

```typescript  theme={"system"}
import type { WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  // instruct the widget to use and build url search params
  buildUrl: true,
};
```

You can then feature the URL search params in the URL when navigating to the page that features the widget.

```typescript  theme={"system"}
https://playground.li.fi/?fromAmount=20&fromChain=42161&fromToken=0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9&toAddress=0x29DaCdF7cCaDf4eE67c923b4C22255A4B2494eD7&toChain=42161&toToken=0xaf88d065e77c8cC2239327C5EDb3A432268e5831
```

Its important to understand this will only work for the widgets initialization - dynamically changing the search params in the URL without a page load will not cause an update of the form values in the widget.

<Note>
  Config values override URL search params

  If you want to use URL search params to populate the widget’s form values on initialization (or page load) its important that those form values are NOT featured in the config object used to initialize the widget. fromAmount, fromChain, fromToken, toAddress, toChain, and toToken should NOT be set on the widget config in order to allow the URL to perform the initial set up of the widgets state.

  On first page load if you have form values in both the config and the URL then the URL search params will be rewritten to match the config values and the widget form will be populated with the values presented in the config.
</Note>

## Update form values

After the widget has initialized there are two ways you can update the form values in the widget

* Using the widget config - this uses reactive values in the config and requires some management of those values for updates

* Using the formRef - this provides an function call that you can use to update values in the widgets form store.

<Note>
  Note that when `buildUrl` is set to `true` in the widget config both methods
  should also update the URL search params as well as the value displayed in the
  widget itself.
</Note>

## Updating by widget config

Once the widget has initialized you can update the form values in the widget by updating the widget config.

To perform an update you should only include the form values in the config that you want to change and ensure these changes are passed to the Widget.

For example, if you want to change the fromChain and fromToken and nothing else you should include only include those values

In addition to the form values you want to change you should also set a formUpdateKey. This needs to be a unique, randomly generated string and is used to ensure that the form values are updated in the widget - essentially forcing an update. This can avoid some edge case issues that might arise when setting values in the widget via a mix of config and user actions via the widgets UI.

Here is an example of what your config would look like.

```typescript  theme={"system"}
import type { WidgetConfig } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
    fromChain: 10,
    fromToken: ‘0x94b008aA00579c1307B0EF2c499aD98a8ce58e58’,
    // use the date object to generate a unique value
    formUpdateKey: new Date().valueOf().toString()
    // config may still feature other config values but
    // should not include other form values…
}
```

You can also reset the form values and their fields to an empty state using `undefined`. This example resets only the fromChain and fromToken form values.

```typescript  theme={"system"}
import type { WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  fromChain: undefined,
  fromToken: undefined,
  // use the date object to generate a unique value
  formUpdateKey: new Date().valueOf().toString(),
  // config may still feature other config values but
  // should not include other form values…
};
```

Here `undefined` used to reset a the widgets form value to an empty state. The absence of a property from the widget config object means that property will remain unchanged.

State management with widget config
When using config to update widgets form values it is often a good choice to consider using an application state management library to store your widget config. There are many options to choose from such as Zustand, MobX, Redux or even React context.

For example, if you were to use Zustand as your state management tool you could use Zustand’s API to access and set values on your config from any part of your application. In addition you would also be able to use Zustand’s equality functionality, such as the built-in `shallow` function, to ensure that your widget config is only used to update the instance of the LiFi Widget when necessary. This should be beneficial for optimizing re-renders.

You can find an example that uses [Zustand to manage widget config](https://github.com/lifinance/widget/tree/main/examples/zustand-widget-config) in the widget repository.

## Updating by form ref

This method provides developers a way to set the form values directly in the widget without making changes to the widget config. By passing a ref object to the widget you can access a function to set values directly on the widgets form state. See the example below.

```typescript  theme={"system"}
import type { FormState } from '@lifi/widget';
import { LiFiWidget } from '@lifi/widget';

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = {
    buildUrl: true,
  };

  const formRef = useRef<FormState>(null);

  const handleClick = () => {
    formRef.current?.setFieldValue( ‘fromChain’, 10, { setUrlSearchParam: true });
  };

  return (
    <>
      <LiFiWidget
        integrator="Your dApp/company name"
        config={widgetConfig}
        formRef={formRef}
      />
      <button onClick={handleClick} type="button">Set fromChain to Optimism</button>
    </>
  )
}
```

Notice the use of `setFieldValue` function.

```typescript  theme={"system"}
formRef.current?.setFieldValue( ‘fromChain’, 10, { setUrlSearchParam: true });
```

Once initialized the `setFieldValue` function can be called to set the form value, note that `setUrlSearchParam` will ensure the url is updated if you have `buildUrl` set to `true` in your widget config.

Here are some examples of usage.

<CodeGroup>
  ```typescript fromChain & fromToken theme={"system"}

  // fromChain and fromToken can be set independently but you might also find that you want to set them at the same time
  formRef.current?.setFieldValue(
      'fromChain',
      10,
      { setUrlSearchParam: true }
  );
  formRef.current?.setFieldValue(
      'fromToken',
      '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      { setUrlSearchParam: true }
  );

  // To reset fromChain and fromToken
  formRef.current?.setFieldValue(
      'fromChain',
      undefined,
      { setUrlSearchParam: true }
  );
  formRef.current?.setFieldValue(
      'fromToken',
      undefined
      { setUrlSearchParam: true }
  );
  ```

  ```typescript fromAmount theme={"system"}
  formRef.current?.setFieldValue(
     'fromAmount',
      '10',
      { setUrlSearchParam: true }
  );

  // To reset fromAmount
  formRef.current?.setFieldValue(
      'fromAmount',
      undefined
      { setUrlSearchParam: true }
  );
  ```

  ```typescript toAddress theme={"system"}
  import { ChainType } from '@lifi/widget';

  formRef.current?.setFieldValue(
      'toAddress',
      {
        name: 'Lenny',
        address: '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea9',
        chainType: ChainType.EVM,
      },
      { setUrlSearchParam: true }
  );

  // To reset toAddress
  formRef.current?.setFieldValue(
      'toAddress',
      undefined
      { setUrlSearchParam: true }
  );
  ```
</CodeGroup>

## Configure allow and deny options

We provide `allow` and `deny` configuration options to control which chains, tokens, bridges, and exchanges can be used within your application. Here’s how you can set up and use these options:

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  // disable BSC from being shown in the chains list
  chains: {
    deny: [56],
  },
  // allow bridging through Stargate bridge only
  bridges: {
    allow: ["stargate"],
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

To control which tokens appear in the **from** and **to** lists, use the `allow` and `deny` options:

* If defined at the top level of the `tokens` object, they apply to **both** lists.
* If defined inside the `from` or `to` objects, they apply **only** to that specific list.
* If an `allow` list is defined, only tokens included in it are allowed. If no `allow` list is defined, all tokens are allowed unless they are explicitly included in `deny`. If a token appears in both `allow` and `deny`, the `allow` list takes precedence.
* A token must pass both the top level `allow`/`deny` check and the check for the current list (`from` or `to`) to be considered allowed.
* Token filters are applied per chain. When tokens are allowed/denied for a specific chain, only that chain's tokens are affected. Other chains remain unfiltered and show all their available tokens.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  tokens: {
    // Top-level allow/deny apply to BOTH 'from' and 'to' lists
    allow: [
      {
        address: "0x0000000000000000000000000000000000000000",
        chainId: 1,
      },
    ],
    deny: [
      {
        address: "0x0000000000000000000000000000000000000000",
        chainId: 137,
      },
    ],
    // 'from' list-specific allow/deny complements top-level settings
    from: {
      allow: [
        {
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          chainId: 1,
        },
      ],
      deny: [
        {
          address: "0x0000000000000000000000000000000000000000",
          chainId: 1,
        },
      ],
    },
    // 'to' list-specific allow/deny
    to: {
      allow: [
        {
          address: "0x0000000000000000000000000000000000000000",
          chainId: 137,
        },
      ],
      deny: [
        {
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          chainId: 1,
        },
      ],
    },
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

Apart from the `allow` and `deny` options, the `tokens` option can be configured to include other tokens or featured tokens that will appear at the top of the corresponding list of tokens.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  tokens: {
    // Featured tokens will appear on top of the list
    featured: [
      {
        address: "0x2fd6c9b869dea106730269e13113361b684f843a",
        symbol: "CHH",
        decimals: 9,
        chainId: 56,
        name: "Chihuahua",
        logoURI:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/21334.png",
      },
    ],
    // Include any token to the list
    include: [
      {
        address: "0xba98c0fbebc892f5b07a42b0febd606913ebc981",
        symbol: "MEH",
        decimals: 18,
        chainId: 1,
        name: "meh",
        logoURI:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/22158.png",
      },
    ],
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

<Columns cols={2}>
  <Card title="With featured tokens" img="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/with_featured_tokens.png?fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=755c43bb7e8c44a9115345155e150f77" data-og-width="882" width="882" data-og-height="1394" height="1394" data-path="images/with_featured_tokens.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/with_featured_tokens.png?w=280&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=f7e663e52f85463764e9a27aae8bb3cc 280w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/with_featured_tokens.png?w=560&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=ea1e90b7ef46ba160bf23b40385a79e5 560w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/with_featured_tokens.png?w=840&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=0c5aee731e1d95111024bda1a1607d6f 840w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/with_featured_tokens.png?w=1100&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=ae1af717f20ae20dbe16d0fa1d61330a 1100w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/with_featured_tokens.png?w=1650&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=2c2ba2fda11542ffa65b6dbb8ff7b296 1650w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/with_featured_tokens.png?w=2500&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=a30b736defcf802324533d384b7eb011 2500w" />

  <Card title="Without featured tokens" img="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/without_ft_tokens.png?fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=9a4c9fae5f7f7fc9d20c5ec7c9b1eb35" data-og-width="880" width="880" data-og-height="1396" height="1396" data-path="images/without_ft_tokens.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/without_ft_tokens.png?w=280&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=03c86672eea457ff7f4578f165460433 280w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/without_ft_tokens.png?w=560&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=e3ac877fa916d8f523392cb5f57e5c7b 560w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/without_ft_tokens.png?w=840&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=30b54d3706bd03188f9a88302e94d3da 840w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/without_ft_tokens.png?w=1100&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=827d05de33697fee066ebd363670b37d 1100w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/without_ft_tokens.png?w=1650&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=71a338d1e2a3da742164f7d7ea4b2857 1650w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/without_ft_tokens.png?w=2500&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=ec075afed8496b5da36fe591fbb6b111 2500w" />
</Columns>

## Destination address

There are use cases where users need to have a different destination address. Usually, they can enter the destination address independently.

Still, the widget also has configuration options to pre-configure the destination address or create a curated list of wallet addresses to choose from.

<Columns cols={2}>
  <Card title="Send to wallet button" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8691d76ad337484ccf24f6ddbda81437" data-og-width="882" width="882" data-og-height="1184" height="1184" data-path="images/send_to_wallet.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=ce3fa4e2489476e3441e007268b64d7f 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=b8b3fa36675f95b93f0871c3e9a7651d 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=fb2f0629a233208bd8c621c4b109e103 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d10362f0e205b855f407484420090f81 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=be231b38ac54094bec14a530283b9e7f 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=dfdf01faaca56cb9bbff6fba778eac45 2500w" />

  <Card title="Send to wallet view" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet_view.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=debc2652d943da8819dd4ae1d16f2441" data-og-width="872" width="872" data-og-height="1068" height="1068" data-path="images/send_to_wallet_view.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet_view.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=b7f38e7cbaa4ff0eb11c97ac95c76cb5 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet_view.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=41a9ae72419f01283a5ec58f673277ef 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet_view.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=b4f7934f0841aa760fb94f4857df642d 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet_view.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8e524cf2169a2220f6081638d2227c04 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet_view.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=1f2bd2b040696ca2902beb5af7f34b38 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/send_to_wallet_view.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=22def3f708431f8f164a2818786ea0f9 2500w" />
</Columns>

## Configure single destination address

Developers can use the `toAddress` option to configure a single destination address. The `address` and `chainType` properties are required, while the `name` and `logoURI` properties are optional.

```typescript  theme={"system"}
import { ChainType, LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  toAddress: {
    name: "Vault Deposit",
    address: "0x0000000000000000000000000000000000000000",
    chainType: ChainType.EVM,
    logoURI: "https://example.com/image.svg",
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

<Frame>
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/dest_address_ex.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=acc2f4c0f467754fc6c36a58f3eb9f09" data-og-width="880" width="880" data-og-height="1184" height="1184" data-path="images/dest_address_ex.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/dest_address_ex.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2a8d24e9181975188b03644d6fbaf486 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/dest_address_ex.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=e62050347346c94e2fda05e4ba79e6f7 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/dest_address_ex.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=478902fa67f545d2907e2bdb52c93687 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/dest_address_ex.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d62d9be8c67988bf08e77bb4f5347323 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/dest_address_ex.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=0df5136c8ae51d0697632c328914aae4 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/dest_address_ex.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=e5ef79a9e888ea8ef8a6a1471917302b 2500w" />
</Frame>

## Configure a curated list of wallet addresses

Developers can use `toAddresses` option to configure a curated list of wallet addresses.

```typescript  theme={"system"}
import { ChainType, LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  toAddresses: [
    {
      name: "Lenny",
      address: "0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea9",
      chainType: ChainType.EVM,
      logoURI: "https://example.com/image.svg",
    },
    {
      address: "0x4577a46A3eCf44E0ed44410B7793977ffbe22CE0",
      chainType: ChainType.EVM,
    },
    {
      name: "My sweet solami",
      address: "6AUWsSCRFSCbrHKH9s84wfzJXtD6mNzAHs11x6pGEcmJ",
      chainType: ChainType.SVM,
    },
  ],
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

Using this configuration, when users click on the `Send to wallet` button, they will open a pre-configured list of addresses from which to choose, skipping the step where they can manually enter the address.

Together with configuring the wallet list, developers can make the destination address required to be filled out. Please see Required destination address for more details.

<Columns cols={2}>
  <Card title="Optional destination address" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/opt_dest_address.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=3c9753923c184e8b9c3fb08da0bcf6a7" data-og-width="936" width="936" data-og-height="1240" height="1240" data-path="images/opt_dest_address.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/opt_dest_address.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6383ff18850849cf8d173275bda3c356 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/opt_dest_address.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=ce2bdce4f4b675a56c2feb9213380a9b 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/opt_dest_address.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=9cac0e2e0bd58cef820b94fc1b45e5e0 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/opt_dest_address.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a89bfce332e33f0978977001de1f5096 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/opt_dest_address.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=7bba39c60ed749982c4291a3b7a4e402 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/opt_dest_address.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=de4839b75d18dd27d9cbb51e97d38b45 2500w" />

  <Card title="A curated list of wallet addresses" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/curated_list_wallet.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=57005d3188f683029f71e857b1a78403" data-og-width="874" width="874" data-og-height="1100" height="1100" data-path="images/curated_list_wallet.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/curated_list_wallet.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=28e89d22ec5aaa6ec797b264af88e562 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/curated_list_wallet.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=9e74de17649f33243f5152e9784bfcd3 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/curated_list_wallet.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=e34d42071c31682a74112d5115a91bf0 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/curated_list_wallet.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=fd91a6e892a4e6e8ebcf0dc381b9951f 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/curated_list_wallet.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8ac7808d261853cf40d60eaaef7d6952 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/curated_list_wallet.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f2b118a681be6132757515e9ea089f90 2500w" />
</Columns>

## Explorer URLs

In the widget there are numerous points where a user can click to open an explorer in a separate browser tab in order to find out more information about a transaction or an address. Any buttons or links in the widget that present this icon will direct the user to an explorer.

We have default behaviors in relation to opening explorers and we can also use widget config to override and change these behaviors.

## Default behavior for chains

Often when trying to direct a user to an explorer the widget will know which chain relates to a transaction or address and it will present an explorer that matches that chain.

For example, after the user has executed a transaction, on the transaction details page they can click on the "Token allowance approved" explorer button to see more detail about that approval. If the approval was done using the Optimism chain then a new tab would open taking the user to optimistic.etherscan.io to show them more information about that approval.

If no explorer can be found in relation to a chain then the user will be directed to LiFi’s explorer.

## Default behavior for internal explorers

An internal explorer is an explorer that is the preferred choice of an organization that is building an app using the widget. In some parts of the widget we use an internal explorer rather than attempting to find an explorer for a specific chain.

For example, once the user has completed a transaction and is on the transaction details page they are presented with a transfer ID (see below). This is accompanied by a link which allows the user to open an explorer in order to find more information about that transaction. There is no attempt to find a chain specific explorer. The default explorer used is LI.FI own internal explorer and users will be directed to [https://scan.li.fi](https://scan.li.fi/)

## Overriding the explorer URLs

It's possible to override the explorer URLs that widget uses via the widget config. We can do this for specific chains and for the internal explorer. You can use your own explorer urls for multiple chains and at the same time state your own alternative for the internal explorer.

### Overriding explorers for a chain

In the widget config you can override chains by adding an entry to the explorerUrls object: you provide the chain id as a key and the base url of the explorer as the value.

```typescript  theme={"system"}
import type { WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  explorerUrls: {
    42161: ["https://scan.li.fi"],
  },
};
```

The explorer specified above will be used only for that chain, in the above example this would be Arbitrum. For other chains that aren’t specified in the explorerUrls object the widget will still present the default behavior (as stated above).

### Overriding explorers for the internal explorer

In the widget config you can override the internal explorer by adding an entry to the explorerUrls object: you provide `internal` as a key and the base url of the explorer as the value.

```typescript  theme={"system"}
import type { WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  explorerUrls: {
    internal: ["https://jumper.exchange/scan"],
  },
};
```

Any places within the widget that use the internal explorer will now use the url stated in the config rather than the default.

## Address and transaction pages

The widget assumes that the explorer will provide pages for addresses at `/address/:address` and for transactions at `/tx/:hash` and will attempt to navigate the user to those pages when the users clicks the related buttons.

A link to a wallet address would look like:

```typescript  theme={"system"}
https://scan.li.fi/address/0xb9c0dE368BECE5e76B52545a8E377a4C118f597B
```

And a link to a transaction would look like:

```typescript  theme={"system"}
https://scan.li.fi/tx/0x05dbd8d3be79ad466e7d2898f719cc47b1b3b545cf4782aece16e11849ddd24b
```

The widget assumes that any explorer used with the widget will follow this convention.

## Adding route labels

The Widget allows you to visually enhance specific routes by adding route labels — styled badges with customizable text and appearance.
To display route labels dynamically, configure the `routeLabels: RouteLabelRule[]` array in your `WidgetConfig`.

```typescript  theme={"system"}
interface RouteLabelRule {
  label: RouteLabel; // The label to display if conditions match
  bridges?: AllowDeny<string>; // Optional: Filter by bridge(s)
  exchanges?: AllowDeny<string>; // Optional: Filter by exchange(s)
  fromChainId?: number[]; // Optional: Filter by source chain ID(s)
  toChainId?: number[]; // Optional: Filter by destination chain ID(s)
  fromTokenAddress?: string[]; // Optional: Filter by source token address(es)
  toTokenAddress?: string[]; // Optional: Filter by destination token address(es)
}
interface RouteLabel {
  text: string; // Text to show on the label
  sx?: SxProps<Theme>; // Optional: Style object (MUI-style)
}
```

Each label rule defines matching conditions and a label configuration that will be applied if the conditions are met.
The label configuration includes `text` and `sx` styling of the badge in the MUI-style CSS-in-JS way.

The rest of the fields determine when and where a label should be applied based on route conditions.
You can combine multiple criteria such as `fromChainId`, `exchanges`, `tokens`, and more.
For bridges and exchanges, use the `allow` and `deny` fields for fine-grained control, similarly to how it is described in [Configure allow and deny options](#configure-allow-and-deny-options).

Example configuration:

```typescript  theme={"system"}
import { ChainId } from "@lifi/sdk";
import type { WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  routeLabels: [
    {
      label: {
        text: "OP Reward",
        sx: {
          background: "linear-gradient(90deg, #ff0404, #ff04c8)",
          "@keyframes gradient": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
          },
          animation: "gradient 3s ease infinite",
          backgroundSize: "200% 200%",
          color: "#ffffff",
        },
      },
      fromChainId: [ChainId.OPT], // Applies to routes from Optimism
    },
    {
      label: {
        text: "LI.FI Bonus",
        sx: {
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          marginLeft: "auto",
          order: 1,
          backgroundImage:
            "url(https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/lifidexaggregator.svg)",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "24px",
          paddingLeft: "12px",
          backgroundColor: "#f5b5ff",
        },
      },
      fromChainId: [ChainId.OPT], // Applies to routes from Optimism
      exchanges: {
        allow: ["relay"], // Only show for Relay routes
      },
    },
  ],
};
```

Rendered example of the configured route labels:

<Frame caption="Route labels example">
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/route-labels-example.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=24ce72146b1efbdc362875fb632f5744" data-og-width="889" width="889" data-og-height="487" height="487" data-path="images/route-labels-example.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/route-labels-example.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=812294fac3020eba2ec9361a50c33600 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/route-labels-example.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bd7607aa04a89ded5f6f65d9c2d9b55c 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/route-labels-example.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8d4f4a1cfa7b30078d62a03819a74434 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/route-labels-example.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d9244c208381836f4bbe2f114c3fb36f 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/route-labels-example.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=1ca5295841d51700d784325742cf95cc 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/route-labels-example.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8559651cfddde117a65a3fe7cbaf3459 2500w" />
</Frame>

Labels only appear when *all* specified criteria are satisfied by a route.

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Customize Widget

> Customize the look and feel of the widget to match the design of your dApp and suit your needs

**LI.FI Widget** supports visual customization, allowing you to match your web app's design. The widget's layout stays consistent, but you can modify colors, fonts, border radius, container styles, disable or hide parts of the UI, and more.

Start customizing the widget by tweaking some of the following options:

```typescript  theme={"system"}
interface WidgetConfig {
  // sets default appearance - light, dark, or auto
  appearance?: Appearance
  // disables parts of the UI
  disabledUI?: DisabledUIType[]
  // hides parts of the UI
  hiddenUI?: HiddenUIType[]
  // makes parts of the UI required
  requiredUI?: RequiredUIType[]
  // tweaks container, components, colors, fonts, border-radius
  theme?: WidgetTheme
}
```

## Theme

By customizing the theme, you can ensure the LI.FI Widget matches the look and feel of your application, providing a seamless user experience.

The `theme` configuration option allows you to customize various aspects of the widget's appearance, including colors, typography, shapes, and component styles.

### Containers

The `container` option customizes the main container of the widget.
The `routesContainer` and `chainSidebarContainer` options apply custom styles to routes and chain sidebar expansions respectively (available in `wide` variant).

In the example below, we adjust the boxShadow and border-radius properties of all the containers.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      theme: {
        container: {
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
        },
        chainSidebarContainer: {
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
        },
        routesContainer: {
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
        },
      },
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Columns cols={2}>
  <Card title="Before" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=87e2de147615fc168c577e2d7913a4ea" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/before.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=aa4a3c6ef4462ae27d32cb8fbd83b2a3 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2178a361184ecff8b50fe84937e7eae0 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=c7db88c95534800ea06c09e9d7d69f52 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=afcbeb0b77936ef364a48dfd95e63d16 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a67305c70a3f74e6d3d997acb8735966 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=9e7e0da9055f953f34d51e4ed16f9ac9 2500w" />

  <Card title="After" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=04f34659897d8b0830a6897a9542562f" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/after.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8fe2404d24f097550638d6c55a5f8abd 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=652243597fd9d2444577e0b6554b178a 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=73997116f6193e028ca04ffb4aa4da53 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=296eafaa56bd1158b845454349c106a1 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4863cf4e9c1e139df374a5aa56100262 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d8da0e35ef6796330443810e886736d9 2500w" />
</Columns>

### Palette, shape, typography

The `palette` option defines the color palette for the widget. You can customize the background colors, greyscale colors, primary and secondary colors, and text colors.

The `shape` option defines border-radius overrides for all elements in the widget.

The `typography` option customizes the font settings like font families.

Let's proceed with the theme and adjust the primary and secondary colors of the inner elements, along with the font family and border-radius.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      theme: {
        palette: {
          primary: { main: '#7B3FE4' },
          secondary: { main: '#F5B5FF' },
        },
        shape: {
          borderRadius: 0,
          borderRadiusSecondary: 0,
        },
        typography: {
          fontFamily: 'Comic Sans MS',
        },
        container: {
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
        },
      },
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Columns cols={2}>
  <Card title="Before" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=711ef05cbc26d024d1e33dcc05885c0b" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/before_pallete.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=21b350be528a539fc3ab1a082ae8f73d 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2e5c312473210bf58ce29f5b0a087236 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=5b2b6e590541eb933f084eba32916ee1 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bb657bbd84851a7f3c6422a1da326721 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d596d19ad58fc5bf68699901917e749b 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=0e52b759cf038f21a89ad8cc3d78657d 2500w" />

  <Card title="After" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=7617b05f16e87b2bdee00acacecc3618" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/after_pallete.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a0f46ce0273b6065c33bc26ce9484dd4 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=c4d10a48599919bdc56b7bd50b45fbfd 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=32dc430e0826159aa006b638e561e3de 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2fb95915c2113793d8959d147a01e484 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=70f6ab9bfa425d4b5c1379fa522545e3 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=50d62c7386f6a3ab27c28a3e5514e3f4 2500w" />
</Columns>

### Components

The `components` option allows you to customize the styles of specific components within the widget.

The current list of available components with more to come:

* **MuiAppBar** is used as a header/navigation component at the top of the widget.

* **MuiAvatar** is used to display token/chain avatars.

* **MuiButton** is used for various buttons in the widget.

* **MuiCard** is used for card elements within the widget. There are also three default card variants available for customization: `outlined`, `elevation`, and `filled`. They can be set using `defaultProps` option (see example below).

  * **outlined** - default variant where the card has thin borders.
  * **elevation** - variant where the card has a shadow.
  * **filled** - variant where the card is filled with color (`palette.background.paper` property).

* **MuiIconButton** is used for icon buttons within the widget.

* **MuiInputCard** is used for input cards within the widget.

* **MuiTabs** is used for tab navigation within the widget (available in `split` subvariant).

With the `components` option, each component can be customized using the MUI's `styleOverrides` property, allowing for granular control over its styling.

Let's take a look at the example, which shows how we can use card component variants together with overriding tabs component styles.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      palette: {
        primary: {
          main: '#006Eff',
        },
        secondary: {
          main: '#FFC800',
        },
        background: {
          default: '#ffffff',
          paper: '#f8f8fa',
        },
        text: {
          primary: '#00070F',
          secondary: '#6A7481',
        },
        grey: {
          200: '#EEEFF2',
          300: '#D5DAE1',
          700: '#555B62',
          800: '#373F48',
        },
      },
      shape: {
        borderRadius: 12,
        borderRadiusSecondary: 12,
        borderRadiusTertiary: 24,
      },
      container: {
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
        borderRadius: '16px',
      },
      components: {
        MuiCard: {
          defaultProps: { variant: 'filled' },
        },
        // Used only for 'split' subvariant and can be safely removed if not used
        MuiTabs: {
          styleOverrides: {
            root: {
              backgroundColor: '#f8f8fa',
              [`.${tabsClasses.indicator}`]: {
                backgroundColor: '#ffffff',
              },
            },
          },
        },
      },
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Frame>
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=72f51bd9d9b7e4c3c5b92d6ace0d51a2" data-og-width="936" width="936" data-og-height="1050" height="1050" data-path="images/filled_card_variant.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=af662c874c7e549e5fad0492b6f7b528 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=61db07fd3704a15b4892be746fde54b3 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8e0eb1ce6547707d17605e11fe650b11 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bbf412199c11b668c0a7368fc3a2d0d4 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=1fca26961871046f082f704ac69e8c34 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=176fff500cc14efcffd95c72812f5f34 2500w" />
</Frame>

## Pre-configured Themes

The LI.FI Widget includes several pre-configured themes that provide a starting point for customization. These themes demonstrate various configurations of colors, shapes, and component styles, giving you an idea of how the widget can be styled to fit different design requirements.

Besides the default theme, there are three pre-configured themes available with more to come.

Developers can import them directly from `@lifi/widget` package.

```typescript  theme={"system"}
import { azureLightTheme, watermelonLightTheme, windows95Theme } from '@lifi/widget'
```

### Watermelon

<Columns cols={2}>
  <Card title="Watermelon compact" img="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=1de72a25f38ef5980993d07ed832415f" data-og-width="950" width="950" data-og-height="1498" height="1498" data-path="images/windows_compact.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=280&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=c47ede963498dd68002d4e7f2b5e4842 280w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=560&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=28824ebc17b56024904240686fb73b86 560w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=840&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=dc6a412b6a2d971d993a595ba2347643 840w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=1100&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=a557bcfc6901780561c85a09577e4cdb 1100w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=1650&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=fb7c7a6d2fe7d0098c714ac67150badf 1650w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=2500&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=350589ab57882ee0f2304e2a06161673 2500w" />

  <Card title="Watermelon wide" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=e861014499cca2437e7fee3f07abcd2a" data-og-width="1536" width="1536" data-og-height="1226" height="1226" data-path="images/watermelon_wide.avif" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=26612a606854d430ed94e07cfe01100e 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=7ea9c780680b5ec5896092fbd7a26aac 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=377fed8b4142ea569fbbbfd422e55da8 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f0a9e3ace8337c7afe8a3ab8406c1c60 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4cd3c90fccf7c0f9552c8e394a995722 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=39574c08acb5954448f3678def494df6 2500w" />
</Columns>

### Azure

<Columns cols={2}>
  <Card title="Azure compact" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=ba8777129bd6934beb2bd75f991814e3" data-og-width="894" width="894" data-og-height="1422" height="1422" data-path="images/azure_compact.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d83ecd984e68c1a0a8c256f8a210bc7d 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4560bd04644671309ac26040dd31b064 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=e412645b9b742c09d3dc36546f1c8575 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=7efeb2213db31a43a706224373d3ff79 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8a51848f3d5145d3cd40d979fa6be8fc 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d05d25aa66b572d954f000c6cd3e2015 2500w" />

  <Card title="Azure wide" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=b9de88dc1fefc06c7ad9c6812d955350" data-og-width="1536" width="1536" data-og-height="1206" height="1206" data-path="images/azure_wide.avif" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a084ac45549ad7308076e473cebdf713 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=187b7d3833b57684afee774031b09d86 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=68736def06caef674c8236620a67a530 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f35f80e2ecf98258b80bc5213da01d86 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6f5d2abeef71f1027ad02432ce531c2f 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8119141055f379d7aca410cc36bdce4e 2500w" />
</Columns>

### Windows 95

<Columns cols={2}>
  <Card title="Windows 95 compact" img="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=1de72a25f38ef5980993d07ed832415f" data-og-width="950" width="950" data-og-height="1498" height="1498" data-path="images/windows_compact.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=280&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=c47ede963498dd68002d4e7f2b5e4842 280w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=560&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=28824ebc17b56024904240686fb73b86 560w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=840&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=dc6a412b6a2d971d993a595ba2347643 840w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=1100&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=a557bcfc6901780561c85a09577e4cdb 1100w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=1650&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=fb7c7a6d2fe7d0098c714ac67150badf 1650w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=2500&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=350589ab57882ee0f2304e2a06161673 2500w" />

  <Card title="Windows 95 wide" img="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=4d192df6d2a766ff8f0c7e0c12cb46af" data-og-width="1536" width="1536" data-og-height="1225" height="1225" data-path="images/windows_wide.avif" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=280&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=6a655704c71e02cc1e1cad0df62fbfe9 280w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=560&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=008b8e7680861fde7b92bfc21ff6b913 560w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=840&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=a8d8e5f43b19224d5f89889689fc2d5c 840w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=1100&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=028a63cbbf44952850eba338068dd5f5 1100w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=1650&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=3f65bff0912c1bdedc0eae53700a00a0 1650w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=2500&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=76d6df007a91ccfe2af3365015c935e4 2500w" />
</Columns>

### Customizing Pre-configured Themes

You can further customize these pre-configured themes by modifying their properties or combining them with your own custom styles. This flexibility allows you to achieve the exact look and feel you desire for your application.

## Appearance

The widget has complete dark mode support out of the box. By default, the `appearance` option is set to `auto`, matching the user's system settings for dark and light modes.

Now, let's set the default appearance to dark.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      appearance: 'dark',
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Columns cols={2}>
  <Card title="Before" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=1cf928050d8e148815b58babb37ee5a1" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/before_appearance.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=cfea20a9defd39579d02375344698a97 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bbe0bdddefe7c2399a455485cd27eb91 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d24e580a1481fb2e3eae796482d94fc7 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=cf93e462e8deb365d737887edfa47502 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=239aa3f331c39515c0b38eefd8c93e8c 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=785a5e78faff38ecae439b05c6140840 2500w" />

  <Card title="After" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=810d79514f58ffc50996fb6227c0759b" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/after_appearance.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=71c960679dd742caac7a7735129dce1a 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d5b6c3e2561ecdea7e946693b8204bbf 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4dcf4376457fea7aa8d3c40a691f3c55 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=3ca1366fbf2c2bc75f8aa81a2a706032 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=026c0dfb68423e154fb03db192cda9dc 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4e330228652618c2819a4aeb2f731fa2 2500w" />
</Columns>

## Layout

There are 4 ways of dealing with the widget's height in terms of layout: **default, restricted max height, restricted height, full height.**

Note that none of these layouts are intend for use with the drawer variant. Default, restricted max height, and restricted height can be used with both wide and compact variants. Full height should only be used with the compact variant.

### Default

By default the widget will have a maximum height of `686px`. This requires no change to the config but fundamentally works in the same way as the restricted max height.

### Restricted Max Height

In restricted max height layout, pages within the widget will occupy only the minimum amount of space needed - the Widgets height will contract and expand but pages shouldn't increase beyond the stated max height. Any pages larger than the max height will be scrollable to allow content to be reached.

You can set the max height on the theme's container object in the config - this should be a number (the number of pixels) and not a string. And its advisable to use a value above `686` which is the default value of the widget's height.

```typescript  theme={"system"}
import { WidgetConfig } from '@lifi/widget'

const widgetConfig: WidgetConfig = {
  theme: {
    container: {
      maxHeight: 820,
    },
  },
}
```

<Frame caption="Page height can change across pages">
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/page_height.gif?s=b36f1dd34ccfdf56d0c61bbe672a958b" data-og-width="532" width="532" data-og-height="864" height="864" data-path="images/page_height.gif" data-optimize="true" data-opv="3" />
</Frame>

### Restricted Height

In restricted height layout, pages within the widget will always occupy the full height stated in the config. When navigating through different pages the height of the widget should remain consistent. Any pages larger than the stated height will be scrollable to allow content to be reached.

You can set the height on the theme's container object in the config - this should be a number (the number of pixels) and not a string. And its advisable to use a value above `686` which is the default value of the widget's height.

```typescript  theme={"system"}
import { WidgetConfig } from '@lifi/widget'

const widgetConfig: WidgetConfig = {
  theme: {
    container: {
      height: 900,
    },
  },
}
```

<Frame caption="Page height stays consistent across pages">
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/consistent_height.gif?s=01e00b209d8227ace987238203faf528" data-og-width="524" width="524" data-og-height="850" height="850" data-path="images/consistent_height.gif" data-optimize="true" data-opv="3" />
</Frame>

Its not recommend to attempt to use the containers height and maxHeight together - in the widget they present different layout modes.

### Full Height

Full height has been included to better present the widget where less screen real estate is available such as on mobile devices. It assumes that the widget will make up the majority of the content and functionality on a page and where possible will allow scrolling via the page itself.

<Frame caption="For use on smaller screens">
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=9b1022996f87f3f14da66422473ce7f2" data-og-width="812" width="812" data-og-height="1604" height="1604" data-path="images/small_screens.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f52e2a08b8f0509036f32009c7cce068 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=91e038f5f1e0a853412c74d62adfd208 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4a7c4df3f0703c983f4bc5368f3fdc2e 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=71a4b2a7e4171852d41da385290dc5de 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a307ac1aa2f03f1a317bd2e0ad037617 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=edce74a9ba3f4c2cba694d4e710f08e3 2500w" />
</Frame>

With this layout the widget will attempt to occupy the full height of the HTML element containing it.

Full height layout can feature number of different properties in the config - we will break each of these down.

```typescript  theme={"system"}
import { WidgetConfig } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
  variant: 'compact'
  theme; {
    container: {
      display: 'flex',
      height: '100%'
    }
    header: {
      position: 'fixed',
      top: 0,
    },
  }
}
```

* **variant should be set as 'compact'** - 'compact' itself is already built to work with smaller screen spaces in mind.
* **theme.container** - this should feature `display: 'flex'` and `height: '100%'` to instruct the widget to occupy the full space of the containing HTML element and to also allow the use of flex layout in some parts of the widget to try to better use available screen space.
* **theme.header** - this is optional.

  * When adding theme.header you should state both `position: 'fixed'` and a top value (above we use `top: 0`)

    * This will make widget's header behavior like a sticky header which stays in a fixed position when other parts of the widgets pages are still scrollable.
    * Setting the top value means that you can account for the position of any elements you might have on your page above the widget. For example if you have a navigation bar that sits above the widget that is 60 pixels in height you should set the top value to `top: 60`

  * Without `theme.header` the widget's header will be scroll with the rest of the widget pages content.

### Considerations when using Full Height

To present the widget for a mobile experience the pages HTML & CSS external to the widget will also have to be considered in addition to the the widget config. In Full Height layout the widget surrenders its height to its external HTML container so container needs to be handled well by the containing application. Here are some things to think about when implementing Full Height layout.

* Viewport meta may need to be updated for the page to present correctly

  * e.g. `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">`

* You may also want to think about how the page behaves in terms of occupying the fully page height. Here is how we do it in the Widget Playground.

  * In the Widget Playground we use `100dvh` with the min-height css which means that if widgets pages are bigger than this that the page can still scroll to allow access to that widget content. Also this means that when widget's pages are smaller than the viewport they can scale and position elements using flex to better use the available space to occupy the full screen height.
  * In CSS you should add `overscroll-behavior: none;` to the root/body of your page to prevent undesired scrolling behavior.
  * Placement on the page in relation to site navigation, header and footers may also have to be considered. We have mocked this experience in the Widget Playground. To see it:

    * Open the Playground Settings and you should be able to toggle the 'show mock header' and 'show mock footer' options.

### Fit Content

This option allows the widget to expand vertically based on the height of its content (excluding scrollable list selectors such as tokens, chains, or transactions).
The maximum height for widget pages that include scrollable lists is defined by the `maxHeight` property.

```typescript  theme={"system"}
import { WidgetConfig } from '@lifi/widget'

const widgetConfig: WidgetConfig = {
  theme: {
    container: {
      height: 'fit-content',
      maxHeight: 800,
    },
  },
}
```

If `maxHeight` is not specified, the default value of `686px` is applied.

## Disabled UI elements

The `disabledUI` property allows you to specify which UI elements should be disabled in the widget. Disabling UI elements can be useful to prevent user interaction with certain parts of the widget that might not be necessary or desirable for your specific implementation.

The `DisabledUI` enum specifies UI elements that can be disabled to prevent user interaction.

```typescript  theme={"system"}
export enum DisabledUI {
  // Disables the input field for the token amount
  FromAmount = 'fromAmount',
  // Disables the button for the source token selection
  FromToken = 'fromToken',
  // Disables the button for specifying the destination address
  ToAddress = 'toAddress',
  // Disables the button for the destination token selection
  ToToken = 'toToken',
}
```

## Hidden UI elements

The `hiddenUI` property allows you to specify which UI elements should be hidden in the widget. This is useful for tailoring the user interface to fit your specific needs by removing elements that might not be relevant for your use case.

The `HiddenUI` enum specifies UI elements that can be hidden from the UI.

```typescript  theme={"system"}
export enum HiddenUI {
  // Hides the appearance settings UI (light/dark mode switch)
  Appearance = 'appearance',
  // Hides the close button in the drawer variant
  DrawerCloseButton = 'drawerCloseButton',
  // Hides the transaction history UI
  History = 'history',
  // Hides the language selection UI
  Language = 'language',
  // Hides the 'Powered by LI.FI' branding - not recommended :)
  PoweredBy = 'poweredBy',
  // Hides the button for specifying the destination address
  ToAddress = 'toAddress',
  // Hides the button for the source token selection
  FromToken = 'fromToken',
  // Hides the button for the destination token selection
  ToToken = 'toToken',
  // Hides the wallet menu UI
  WalletMenu = 'walletMenu',
  // Hides the integrator-specific step details UI
  IntegratorStepDetails = 'integratorStepDetails',
  // Hides the button to reverse/swap the from and to tokens
  ReverseTokensButton = 'reverseTokensButton',
  // Hides the token description in routes
  RouteTokenDescription = 'routeTokenDescription',
  // Hides the chain selection UI
  ChainSelect = 'chainSelect',
  // Hides the bridges settings UI
  BridgesSettings = 'bridgesSettings',
  // Hides the connected wallets section in address book
  AddressBookConnectedWallets = 'addressBookConnectedWallets',
  // Hides the low address activity confirmation dialog
  LowAddressActivityConfirmation = 'lowAddressActivityConfirmation',
  // Hides the gas refuel message UI
  GasRefuelMessage = 'gasRefuelMessage',
  // Hides the search bar in the tokens list
  SearchTokenInput = 'searchTokenInput',
  // Hides the contact support button
  ContactSupport = 'contactSupport',
}
```

The following example shows how to hide appearance and language settings in the UI.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      hiddenUI: ['language', 'appearance'],
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Columns cols={2}>
  <Card title="Before" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=71f1260a0fcfc0d589a52d21d3c8a581" data-og-width="934" width="934" data-og-height="1270" height="1270" data-path="images/before_hidden.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=3cdee3cc5dfa45aea8b65b6d49b8b3ea 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6071ac156f3085ee110114a7167eea39 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=385bf6c20f6db9d5b169fbda00c3cb16 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2735819b048a06dde6504e714965e5ae 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=300f292d65163bec94c63ada03cca085 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f03c460c2aa4200b95c6d88c67bcb2db 2500w" />

  <Card title="After" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=45637b09a5e42175004aea434d6eb46f" data-og-width="936" width="936" data-og-height="1018" height="1018" data-path="images/after_hidden.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=46b3415d56c1d5f3c77fe383fd603954 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=9c8b8c6d137dec41128efb8ca8b89706 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8a1e3c9a6bf5084a0c1ce0c1cf465d29 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=ee33ba6a33c3dda56df60b7c01b1bf09 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=cbb118b8046788b0a51d50b7788eabee 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6e04fa121ace0fc2837b34a1b8ce8a63 2500w" />
</Columns>

## Required UI elements

The `requiredUI` property allows you to specify which UI elements should be required in the widget. This means that the user must interact with these elements for the widget to proceed with swapping/bridging. This is useful for ensuring that certain critical inputs are provided by the user.

The `RequiredUI` enum specifies UI elements that are required to be filled out or interacted with by the user.

```typescript  theme={"system"}
export enum RequiredUI {
  // Makes the button for the destination address required for interaction
  ToAddress = 'toAddress',
}
```

### Required destination address

Making the destination address required can come in handy when developers want to build a flow where only a pre-configured list of wallet addresses can be set as the destination. See [Configure a curated list of wallet addresses](https://docs.li.fi/integrate-li.fi-widget/configure-widget#configure-a-curated-list-of-wallet-addresses) for more details.

If you are interested in additional customization options for your service, reach out via our [Discord](https://discord.gg/lifi) or [Partnership](https://docs.li.fi/overview/partnership) page.

As you can see, widget customization is pretty straightforward. We are eager to see what combinations you will come up with as we continue to add new customization options.

[⚡Widget Events](https://docs.li.fi/integrate-li.fi-widget/widget-events)

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Customize Widget

> Customize the look and feel of the widget to match the design of your dApp and suit your needs

**LI.FI Widget** supports visual customization, allowing you to match your web app's design. The widget's layout stays consistent, but you can modify colors, fonts, border radius, container styles, disable or hide parts of the UI, and more.

Start customizing the widget by tweaking some of the following options:

```typescript  theme={"system"}
interface WidgetConfig {
  // sets default appearance - light, dark, or auto
  appearance?: Appearance
  // disables parts of the UI
  disabledUI?: DisabledUIType[]
  // hides parts of the UI
  hiddenUI?: HiddenUIType[]
  // makes parts of the UI required
  requiredUI?: RequiredUIType[]
  // tweaks container, components, colors, fonts, border-radius
  theme?: WidgetTheme
}
```

## Theme

By customizing the theme, you can ensure the LI.FI Widget matches the look and feel of your application, providing a seamless user experience.

The `theme` configuration option allows you to customize various aspects of the widget's appearance, including colors, typography, shapes, and component styles.

### Containers

The `container` option customizes the main container of the widget.
The `routesContainer` and `chainSidebarContainer` options apply custom styles to routes and chain sidebar expansions respectively (available in `wide` variant).

In the example below, we adjust the boxShadow and border-radius properties of all the containers.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      theme: {
        container: {
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
        },
        chainSidebarContainer: {
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
        },
        routesContainer: {
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
        },
      },
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Columns cols={2}>
  <Card title="Before" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=87e2de147615fc168c577e2d7913a4ea" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/before.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=aa4a3c6ef4462ae27d32cb8fbd83b2a3 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2178a361184ecff8b50fe84937e7eae0 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=c7db88c95534800ea06c09e9d7d69f52 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=afcbeb0b77936ef364a48dfd95e63d16 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a67305c70a3f74e6d3d997acb8735966 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=9e7e0da9055f953f34d51e4ed16f9ac9 2500w" />

  <Card title="After" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=04f34659897d8b0830a6897a9542562f" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/after.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8fe2404d24f097550638d6c55a5f8abd 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=652243597fd9d2444577e0b6554b178a 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=73997116f6193e028ca04ffb4aa4da53 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=296eafaa56bd1158b845454349c106a1 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4863cf4e9c1e139df374a5aa56100262 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d8da0e35ef6796330443810e886736d9 2500w" />
</Columns>

### Palette, shape, typography

The `palette` option defines the color palette for the widget. You can customize the background colors, greyscale colors, primary and secondary colors, and text colors.

The `shape` option defines border-radius overrides for all elements in the widget.

The `typography` option customizes the font settings like font families.

Let's proceed with the theme and adjust the primary and secondary colors of the inner elements, along with the font family and border-radius.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      theme: {
        palette: {
          primary: { main: '#7B3FE4' },
          secondary: { main: '#F5B5FF' },
        },
        shape: {
          borderRadius: 0,
          borderRadiusSecondary: 0,
        },
        typography: {
          fontFamily: 'Comic Sans MS',
        },
        container: {
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
        },
      },
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Columns cols={2}>
  <Card title="Before" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=711ef05cbc26d024d1e33dcc05885c0b" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/before_pallete.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=21b350be528a539fc3ab1a082ae8f73d 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2e5c312473210bf58ce29f5b0a087236 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=5b2b6e590541eb933f084eba32916ee1 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bb657bbd84851a7f3c6422a1da326721 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d596d19ad58fc5bf68699901917e749b 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_pallete.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=0e52b759cf038f21a89ad8cc3d78657d 2500w" />

  <Card title="After" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=7617b05f16e87b2bdee00acacecc3618" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/after_pallete.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a0f46ce0273b6065c33bc26ce9484dd4 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=c4d10a48599919bdc56b7bd50b45fbfd 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=32dc430e0826159aa006b638e561e3de 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2fb95915c2113793d8959d147a01e484 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=70f6ab9bfa425d4b5c1379fa522545e3 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_pallete.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=50d62c7386f6a3ab27c28a3e5514e3f4 2500w" />
</Columns>

### Components

The `components` option allows you to customize the styles of specific components within the widget.

The current list of available components with more to come:

* **MuiAppBar** is used as a header/navigation component at the top of the widget.

* **MuiAvatar** is used to display token/chain avatars.

* **MuiButton** is used for various buttons in the widget.

* **MuiCard** is used for card elements within the widget. There are also three default card variants available for customization: `outlined`, `elevation`, and `filled`. They can be set using `defaultProps` option (see example below).

  * **outlined** - default variant where the card has thin borders.
  * **elevation** - variant where the card has a shadow.
  * **filled** - variant where the card is filled with color (`palette.background.paper` property).

* **MuiIconButton** is used for icon buttons within the widget.

* **MuiInputCard** is used for input cards within the widget.

* **MuiTabs** is used for tab navigation within the widget (available in `split` subvariant).

With the `components` option, each component can be customized using the MUI's `styleOverrides` property, allowing for granular control over its styling.

Let's take a look at the example, which shows how we can use card component variants together with overriding tabs component styles.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      palette: {
        primary: {
          main: '#006Eff',
        },
        secondary: {
          main: '#FFC800',
        },
        background: {
          default: '#ffffff',
          paper: '#f8f8fa',
        },
        text: {
          primary: '#00070F',
          secondary: '#6A7481',
        },
        grey: {
          200: '#EEEFF2',
          300: '#D5DAE1',
          700: '#555B62',
          800: '#373F48',
        },
      },
      shape: {
        borderRadius: 12,
        borderRadiusSecondary: 12,
        borderRadiusTertiary: 24,
      },
      container: {
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
        borderRadius: '16px',
      },
      components: {
        MuiCard: {
          defaultProps: { variant: 'filled' },
        },
        // Used only for 'split' subvariant and can be safely removed if not used
        MuiTabs: {
          styleOverrides: {
            root: {
              backgroundColor: '#f8f8fa',
              [`.${tabsClasses.indicator}`]: {
                backgroundColor: '#ffffff',
              },
            },
          },
        },
      },
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Frame>
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=72f51bd9d9b7e4c3c5b92d6ace0d51a2" data-og-width="936" width="936" data-og-height="1050" height="1050" data-path="images/filled_card_variant.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=af662c874c7e549e5fad0492b6f7b528 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=61db07fd3704a15b4892be746fde54b3 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8e0eb1ce6547707d17605e11fe650b11 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bbf412199c11b668c0a7368fc3a2d0d4 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=1fca26961871046f082f704ac69e8c34 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/filled_card_variant.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=176fff500cc14efcffd95c72812f5f34 2500w" />
</Frame>

## Pre-configured Themes

The LI.FI Widget includes several pre-configured themes that provide a starting point for customization. These themes demonstrate various configurations of colors, shapes, and component styles, giving you an idea of how the widget can be styled to fit different design requirements.

Besides the default theme, there are three pre-configured themes available with more to come.

Developers can import them directly from `@lifi/widget` package.

```typescript  theme={"system"}
import { azureLightTheme, watermelonLightTheme, windows95Theme } from '@lifi/widget'
```

### Watermelon

<Columns cols={2}>
  <Card title="Watermelon compact" img="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=1de72a25f38ef5980993d07ed832415f" data-og-width="950" width="950" data-og-height="1498" height="1498" data-path="images/windows_compact.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=280&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=c47ede963498dd68002d4e7f2b5e4842 280w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=560&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=28824ebc17b56024904240686fb73b86 560w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=840&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=dc6a412b6a2d971d993a595ba2347643 840w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=1100&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=a557bcfc6901780561c85a09577e4cdb 1100w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=1650&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=fb7c7a6d2fe7d0098c714ac67150badf 1650w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=2500&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=350589ab57882ee0f2304e2a06161673 2500w" />

  <Card title="Watermelon wide" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=e861014499cca2437e7fee3f07abcd2a" data-og-width="1536" width="1536" data-og-height="1226" height="1226" data-path="images/watermelon_wide.avif" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=26612a606854d430ed94e07cfe01100e 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=7ea9c780680b5ec5896092fbd7a26aac 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=377fed8b4142ea569fbbbfd422e55da8 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f0a9e3ace8337c7afe8a3ab8406c1c60 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4cd3c90fccf7c0f9552c8e394a995722 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/watermelon_wide.avif?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=39574c08acb5954448f3678def494df6 2500w" />
</Columns>

### Azure

<Columns cols={2}>
  <Card title="Azure compact" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=ba8777129bd6934beb2bd75f991814e3" data-og-width="894" width="894" data-og-height="1422" height="1422" data-path="images/azure_compact.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d83ecd984e68c1a0a8c256f8a210bc7d 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4560bd04644671309ac26040dd31b064 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=e412645b9b742c09d3dc36546f1c8575 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=7efeb2213db31a43a706224373d3ff79 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8a51848f3d5145d3cd40d979fa6be8fc 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_compact.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d05d25aa66b572d954f000c6cd3e2015 2500w" />

  <Card title="Azure wide" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=b9de88dc1fefc06c7ad9c6812d955350" data-og-width="1536" width="1536" data-og-height="1206" height="1206" data-path="images/azure_wide.avif" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a084ac45549ad7308076e473cebdf713 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=187b7d3833b57684afee774031b09d86 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=68736def06caef674c8236620a67a530 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f35f80e2ecf98258b80bc5213da01d86 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6f5d2abeef71f1027ad02432ce531c2f 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/azure_wide.avif?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8119141055f379d7aca410cc36bdce4e 2500w" />
</Columns>

### Windows 95

<Columns cols={2}>
  <Card title="Windows 95 compact" img="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=1de72a25f38ef5980993d07ed832415f" data-og-width="950" width="950" data-og-height="1498" height="1498" data-path="images/windows_compact.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=280&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=c47ede963498dd68002d4e7f2b5e4842 280w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=560&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=28824ebc17b56024904240686fb73b86 560w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=840&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=dc6a412b6a2d971d993a595ba2347643 840w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=1100&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=a557bcfc6901780561c85a09577e4cdb 1100w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=1650&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=fb7c7a6d2fe7d0098c714ac67150badf 1650w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_compact.png?w=2500&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=350589ab57882ee0f2304e2a06161673 2500w" />

  <Card title="Windows 95 wide" img="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=4d192df6d2a766ff8f0c7e0c12cb46af" data-og-width="1536" width="1536" data-og-height="1225" height="1225" data-path="images/windows_wide.avif" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=280&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=6a655704c71e02cc1e1cad0df62fbfe9 280w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=560&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=008b8e7680861fde7b92bfc21ff6b913 560w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=840&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=a8d8e5f43b19224d5f89889689fc2d5c 840w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=1100&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=028a63cbbf44952850eba338068dd5f5 1100w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=1650&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=3f65bff0912c1bdedc0eae53700a00a0 1650w, https://mintcdn.com/lifi/EmProAEgMrruLUbI/images/windows_wide.avif?w=2500&fit=max&auto=format&n=EmProAEgMrruLUbI&q=85&s=76d6df007a91ccfe2af3365015c935e4 2500w" />
</Columns>

### Customizing Pre-configured Themes

You can further customize these pre-configured themes by modifying their properties or combining them with your own custom styles. This flexibility allows you to achieve the exact look and feel you desire for your application.

## Appearance

The widget has complete dark mode support out of the box. By default, the `appearance` option is set to `auto`, matching the user's system settings for dark and light modes.

Now, let's set the default appearance to dark.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      appearance: 'dark',
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Columns cols={2}>
  <Card title="Before" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=1cf928050d8e148815b58babb37ee5a1" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/before_appearance.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=cfea20a9defd39579d02375344698a97 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=bbe0bdddefe7c2399a455485cd27eb91 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d24e580a1481fb2e3eae796482d94fc7 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=cf93e462e8deb365d737887edfa47502 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=239aa3f331c39515c0b38eefd8c93e8c 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_appearance.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=785a5e78faff38ecae439b05c6140840 2500w" />

  <Card title="After" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=810d79514f58ffc50996fb6227c0759b" data-og-width="936" width="936" data-og-height="1000" height="1000" data-path="images/after_appearance.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=71c960679dd742caac7a7735129dce1a 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=d5b6c3e2561ecdea7e946693b8204bbf 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4dcf4376457fea7aa8d3c40a691f3c55 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=3ca1366fbf2c2bc75f8aa81a2a706032 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=026c0dfb68423e154fb03db192cda9dc 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_appearance.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4e330228652618c2819a4aeb2f731fa2 2500w" />
</Columns>

## Layout

There are 4 ways of dealing with the widget's height in terms of layout: **default, restricted max height, restricted height, full height.**

Note that none of these layouts are intend for use with the drawer variant. Default, restricted max height, and restricted height can be used with both wide and compact variants. Full height should only be used with the compact variant.

### Default

By default the widget will have a maximum height of `686px`. This requires no change to the config but fundamentally works in the same way as the restricted max height.

### Restricted Max Height

In restricted max height layout, pages within the widget will occupy only the minimum amount of space needed - the Widgets height will contract and expand but pages shouldn't increase beyond the stated max height. Any pages larger than the max height will be scrollable to allow content to be reached.

You can set the max height on the theme's container object in the config - this should be a number (the number of pixels) and not a string. And its advisable to use a value above `686` which is the default value of the widget's height.

```typescript  theme={"system"}
import { WidgetConfig } from '@lifi/widget'

const widgetConfig: WidgetConfig = {
  theme: {
    container: {
      maxHeight: 820,
    },
  },
}
```

<Frame caption="Page height can change across pages">
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/page_height.gif?s=b36f1dd34ccfdf56d0c61bbe672a958b" data-og-width="532" width="532" data-og-height="864" height="864" data-path="images/page_height.gif" data-optimize="true" data-opv="3" />
</Frame>

### Restricted Height

In restricted height layout, pages within the widget will always occupy the full height stated in the config. When navigating through different pages the height of the widget should remain consistent. Any pages larger than the stated height will be scrollable to allow content to be reached.

You can set the height on the theme's container object in the config - this should be a number (the number of pixels) and not a string. And its advisable to use a value above `686` which is the default value of the widget's height.

```typescript  theme={"system"}
import { WidgetConfig } from '@lifi/widget'

const widgetConfig: WidgetConfig = {
  theme: {
    container: {
      height: 900,
    },
  },
}
```

<Frame caption="Page height stays consistent across pages">
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/consistent_height.gif?s=01e00b209d8227ace987238203faf528" data-og-width="524" width="524" data-og-height="850" height="850" data-path="images/consistent_height.gif" data-optimize="true" data-opv="3" />
</Frame>

Its not recommend to attempt to use the containers height and maxHeight together - in the widget they present different layout modes.

### Full Height

Full height has been included to better present the widget where less screen real estate is available such as on mobile devices. It assumes that the widget will make up the majority of the content and functionality on a page and where possible will allow scrolling via the page itself.

<Frame caption="For use on smaller screens">
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=9b1022996f87f3f14da66422473ce7f2" data-og-width="812" width="812" data-og-height="1604" height="1604" data-path="images/small_screens.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f52e2a08b8f0509036f32009c7cce068 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=91e038f5f1e0a853412c74d62adfd208 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=4a7c4df3f0703c983f4bc5368f3fdc2e 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=71a4b2a7e4171852d41da385290dc5de 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=a307ac1aa2f03f1a317bd2e0ad037617 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/small_screens.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=edce74a9ba3f4c2cba694d4e710f08e3 2500w" />
</Frame>

With this layout the widget will attempt to occupy the full height of the HTML element containing it.

Full height layout can feature number of different properties in the config - we will break each of these down.

```typescript  theme={"system"}
import { WidgetConfig } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
  variant: 'compact'
  theme; {
    container: {
      display: 'flex',
      height: '100%'
    }
    header: {
      position: 'fixed',
      top: 0,
    },
  }
}
```

* **variant should be set as 'compact'** - 'compact' itself is already built to work with smaller screen spaces in mind.
* **theme.container** - this should feature `display: 'flex'` and `height: '100%'` to instruct the widget to occupy the full space of the containing HTML element and to also allow the use of flex layout in some parts of the widget to try to better use available screen space.
* **theme.header** - this is optional.

  * When adding theme.header you should state both `position: 'fixed'` and a top value (above we use `top: 0`)

    * This will make widget's header behavior like a sticky header which stays in a fixed position when other parts of the widgets pages are still scrollable.
    * Setting the top value means that you can account for the position of any elements you might have on your page above the widget. For example if you have a navigation bar that sits above the widget that is 60 pixels in height you should set the top value to `top: 60`

  * Without `theme.header` the widget's header will be scroll with the rest of the widget pages content.

### Considerations when using Full Height

To present the widget for a mobile experience the pages HTML & CSS external to the widget will also have to be considered in addition to the the widget config. In Full Height layout the widget surrenders its height to its external HTML container so container needs to be handled well by the containing application. Here are some things to think about when implementing Full Height layout.

* Viewport meta may need to be updated for the page to present correctly

  * e.g. `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">`

* You may also want to think about how the page behaves in terms of occupying the fully page height. Here is how we do it in the Widget Playground.

  * In the Widget Playground we use `100dvh` with the min-height css which means that if widgets pages are bigger than this that the page can still scroll to allow access to that widget content. Also this means that when widget's pages are smaller than the viewport they can scale and position elements using flex to better use the available space to occupy the full screen height.
  * In CSS you should add `overscroll-behavior: none;` to the root/body of your page to prevent undesired scrolling behavior.
  * Placement on the page in relation to site navigation, header and footers may also have to be considered. We have mocked this experience in the Widget Playground. To see it:

    * Open the Playground Settings and you should be able to toggle the 'show mock header' and 'show mock footer' options.

### Fit Content

This option allows the widget to expand vertically based on the height of its content (excluding scrollable list selectors such as tokens, chains, or transactions).
The maximum height for widget pages that include scrollable lists is defined by the `maxHeight` property.

```typescript  theme={"system"}
import { WidgetConfig } from '@lifi/widget'

const widgetConfig: WidgetConfig = {
  theme: {
    container: {
      height: 'fit-content',
      maxHeight: 800,
    },
  },
}
```

If `maxHeight` is not specified, the default value of `686px` is applied.

## Disabled UI elements

The `disabledUI` property allows you to specify which UI elements should be disabled in the widget. Disabling UI elements can be useful to prevent user interaction with certain parts of the widget that might not be necessary or desirable for your specific implementation.

The `DisabledUI` enum specifies UI elements that can be disabled to prevent user interaction.

```typescript  theme={"system"}
export enum DisabledUI {
  // Disables the input field for the token amount
  FromAmount = 'fromAmount',
  // Disables the button for the source token selection
  FromToken = 'fromToken',
  // Disables the button for specifying the destination address
  ToAddress = 'toAddress',
  // Disables the button for the destination token selection
  ToToken = 'toToken',
}
```

## Hidden UI elements

The `hiddenUI` property allows you to specify which UI elements should be hidden in the widget. This is useful for tailoring the user interface to fit your specific needs by removing elements that might not be relevant for your use case.

The `HiddenUI` enum specifies UI elements that can be hidden from the UI.

```typescript  theme={"system"}
export enum HiddenUI {
  // Hides the appearance settings UI (light/dark mode switch)
  Appearance = 'appearance',
  // Hides the close button in the drawer variant
  DrawerCloseButton = 'drawerCloseButton',
  // Hides the transaction history UI
  History = 'history',
  // Hides the language selection UI
  Language = 'language',
  // Hides the 'Powered by LI.FI' branding - not recommended :)
  PoweredBy = 'poweredBy',
  // Hides the button for specifying the destination address
  ToAddress = 'toAddress',
  // Hides the button for the source token selection
  FromToken = 'fromToken',
  // Hides the button for the destination token selection
  ToToken = 'toToken',
  // Hides the wallet menu UI
  WalletMenu = 'walletMenu',
  // Hides the integrator-specific step details UI
  IntegratorStepDetails = 'integratorStepDetails',
  // Hides the button to reverse/swap the from and to tokens
  ReverseTokensButton = 'reverseTokensButton',
  // Hides the token description in routes
  RouteTokenDescription = 'routeTokenDescription',
  // Hides the chain selection UI
  ChainSelect = 'chainSelect',
  // Hides the bridges settings UI
  BridgesSettings = 'bridgesSettings',
  // Hides the connected wallets section in address book
  AddressBookConnectedWallets = 'addressBookConnectedWallets',
  // Hides the low address activity confirmation dialog
  LowAddressActivityConfirmation = 'lowAddressActivityConfirmation',
  // Hides the gas refuel message UI
  GasRefuelMessage = 'gasRefuelMessage',
  // Hides the search bar in the tokens list
  SearchTokenInput = 'searchTokenInput',
  // Hides the contact support button
  ContactSupport = 'contactSupport',
}
```

The following example shows how to hide appearance and language settings in the UI.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'
import { useMemo } from 'react'

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      hiddenUI: ['language', 'appearance'],
    }),
    []
  )

  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```

<Columns cols={2}>
  <Card title="Before" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=71f1260a0fcfc0d589a52d21d3c8a581" data-og-width="934" width="934" data-og-height="1270" height="1270" data-path="images/before_hidden.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=3cdee3cc5dfa45aea8b65b6d49b8b3ea 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6071ac156f3085ee110114a7167eea39 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=385bf6c20f6db9d5b169fbda00c3cb16 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=2735819b048a06dde6504e714965e5ae 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=300f292d65163bec94c63ada03cca085 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/before_hidden.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=f03c460c2aa4200b95c6d88c67bcb2db 2500w" />

  <Card title="After" img="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=45637b09a5e42175004aea434d6eb46f" data-og-width="936" width="936" data-og-height="1018" height="1018" data-path="images/after_hidden.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=280&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=46b3415d56c1d5f3c77fe383fd603954 280w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=560&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=9c8b8c6d137dec41128efb8ca8b89706 560w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=840&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=8a1e3c9a6bf5084a0c1ce0c1cf465d29 840w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=1100&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=ee33ba6a33c3dda56df60b7c01b1bf09 1100w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=1650&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=cbb118b8046788b0a51d50b7788eabee 1650w, https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/after_hidden.png?w=2500&fit=max&auto=format&n=08FOM1AsMmrVbIEl&q=85&s=6e04fa121ace0fc2837b34a1b8ce8a63 2500w" />
</Columns>

## Required UI elements

The `requiredUI` property allows you to specify which UI elements should be required in the widget. This means that the user must interact with these elements for the widget to proceed with swapping/bridging. This is useful for ensuring that certain critical inputs are provided by the user.

The `RequiredUI` enum specifies UI elements that are required to be filled out or interacted with by the user.

```typescript  theme={"system"}
export enum RequiredUI {
  // Makes the button for the destination address required for interaction
  ToAddress = 'toAddress',
}
```

### Required destination address

Making the destination address required can come in handy when developers want to build a flow where only a pre-configured list of wallet addresses can be set as the destination. See [Configure a curated list of wallet addresses](https://docs.li.fi/integrate-li.fi-widget/configure-widget#configure-a-curated-list-of-wallet-addresses) for more details.

If you are interested in additional customization options for your service, reach out via our [Discord](https://discord.gg/lifi) or [Partnership](https://docs.li.fi/overview/partnership) page.

As you can see, widget customization is pretty straightforward. We are eager to see what combinations you will come up with as we continue to add new customization options.

[⚡Widget Events](https://docs.li.fi/integrate-li.fi-widget/widget-events)

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Monetize Widget

> Learn how to configure fees and monetize your LI.FI Widget integration.

<Note>
  For more details about how fees work, fee collection on different chains, and
  setting up fee wallets, see the [Monetizing the
  integration](/introduction/integrating-lifi/monetizing-integration) guide.
</Note>

There are two ways to configure fees in the Widget: a simple `fee` prop for basic use cases, or an advanced `feeConfig` configuration that provides more flexibility and customization options.

### Simple fee configuration

```JavaScript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
  // Set fee parameter to 3%
  fee: 0.03,
  // Other options...
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="fee-demo" config={widgetConfig} />
  );
};
```

### Advanced fee configuration

For more advanced use cases, you can use the `feeConfig` parameter which provides additional customization options:

```JavaScript  theme={"system"}
import { LiFiWidget, WidgetConfig, WidgetFeeConfig } from '@lifi/widget';

// Basic advanced configuration
const basicFeeConfig: WidgetFeeConfig = {
  name: "DApp fee",
  logoURI: "https://yourdapp.com/logo.png",
  fee: 0.01, // 1% fee
  showFeePercentage: true,
  showFeeTooltip: true
};

// Dynamic fee calculation
const dynamicFeeConfig: WidgetFeeConfig = {
  name: "DApp fee",
  logoURI: "https://yourdapp.com/logo.png",
  showFeePercentage: true,
  showFeeTooltip: true,
  calculateFee: async (params) => {
    // Custom logic to calculate fees based on token, amount, etc.
    const { fromTokenAddress, toTokenAddress, fromAmount } = params;

    // Example: Different fees for different token pairs
    if (fromTokenAddress === "0x..." && toTokenAddress === "0x...") {
      return 0.02; // 2% for specific pair
    }

    // Example: Volume-based fee structure
    if (parseFloat(fromAmount) > 1000) {
      return 0.015; // 1.5% for large volumes
    }

    return 0.03; // Default 3% fee
  }
};

const widgetConfig: WidgetConfig = {
  feeConfig: basicFeeConfig, // or dynamicFeeConfig
  // Other options...
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="fee-demo" config={widgetConfig} />
  );
};
```

<Frame caption="Example of the advanced fee configuration">
  <img src="https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=a71a8dc0f48410fff17b1a40104d152e" data-og-width="1832" width="1832" data-og-height="1458" height="1458" data-path="images/widget-monetizing-integration.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=280&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=838b1b49e9d492db449528585d980126 280w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=560&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=03eb977868c8c4b6db8c2593d8c52f55 560w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=840&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=9ad9c2eb80e64a4a7edb173427d76bb4 840w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=1100&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=6b1b83ab709baf6d1f60f91ce9b54eba 1100w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=1650&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=462344fda8dd4a5c255303aeef695fc8 1650w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=2500&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=b9097513f326a4029aaaf0eed23863c0 2500w" />
</Frame>

### WidgetFeeConfig interface

The `WidgetFeeConfig` interface provides the following options:

* **`name`** (optional): Display name for your integration shown in fee details
* **`logoURI`** (optional): URL to your logo displayed alongside fee information
* **`fee`** (optional): Fixed fee percentage (e.g., 0.03 for 3%)
* **`showFeePercentage`** (default: false): Whether to display the fee percentage in the UI
* **`showFeeTooltip`** (default: false): Whether to show a tooltip with fee details (requires `name` or `feeTooltipComponent`)
* **`feeTooltipComponent`** (optional): Custom React component for the fee tooltip
* **`calculateFee`** (optional): Function for dynamic fee calculation based on transaction parameters

<Note>
  Only use either `fee` or `calculateFee` - not both. The `calculateFee`
  function allows for dynamic fee calculation based on factors like token pairs,
  transaction amounts, user tiers, or any other custom logic.
</Note>

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Wallet Management

> Configure your widget for seamless wallet management

The widget has a built-in wallet management UI, so you can connect the wallet and use the widget as a standalone dApp out of the box. However, when embedding the widget into the dApp, reusing the existing wallet management UI of that dApp makes the most sense.

There are several ecosystems and types of chains (EVM, SVM, UTXO) supported by the widget, and therefore, there are several different libraries used to manage wallet connections to these chains.

## EVM wallet connection

To manage wallet connection to EVM (Ethereum Virtual Machine) chains, switching chains, etc., the widget uses the [Wagmi](https://wagmi.sh/) library internally and also provides first-class support for all Wagmi-based libraries such as [RainbowKit](https://www.rainbowkit.com/), [Dynamic](https://github.com/lifinance/widget/tree/main/examples/dynamic), [Reown AppKit](https://docs.reown.com/appkit/overview)

If you already manage wallets using Wagmi or Wagmi-based library in your dApp and the Widget detects that it is wrapped in [WagmiProvider](https://wagmi.sh/react/api/WagmiProvider) it will start re-using your wallet management without any additional configuration.

The example below shows how to preconfigure a basic wallet management using Wagmi.

```typescript  theme={"system"}
import { LiFiWidget } from "@lifi/widget";
import { createClient } from "viem";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, arbitrum, optimism, scroll } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const wagmiConfig = createConfig({
  // Make sure to provide the full list of chains
  // you would like to support in the Widget
  // and keep them in sync, so all functionality
  // like switching chains can work correctly.
  chains: [mainnet, arbitrum, optimism, scroll],
  connectors: [injected()],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

export const WidgetPage = () => {
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount>
      <LiFiWidget integrator="wagmi-example" />
    </WagmiProvider>
  );
};
```

### Keep chains in sync

It is important to keep the Wagmi chains configuration in sync with the Widget chain list so all functionality, like switching chains, can keep working correctly.

There are two approaches to this:

1. Manually update the Widget and Wagmi chains configuration to specify all chains you would like to support in your dApp and the Widget. See [Configure Widget](https://docs.li.fi/integrate-li.fi-widget/configure-widget) page to know more about the Widget's allow/deny chains configuration.
2. Get all available chains from LI.FI API and dynamically update Wagmi configuration. The Widget provides hooks to ease this approach.

Here is an example of how to support all available LI.FI chains dynamically using Wagmi and additional hooks from `@lifi/widget` package.

<CodeGroup>
  ```typescript WalletProvider.tsx theme={"system"}
  import { useSyncWagmiConfig } from '@lifi/wallet-management';
  import { useAvailableChains } from '@lifi/widget';
  import { injected } from '@wagmi/connectors';
  import { useRef, type FC, type PropsWithChildren } from 'react';
  import { createClient, http } from 'viem';
  import { mainnet } from 'viem/chains';
  import type { Config } from 'wagmi';
  import { createConfig, WagmiProvider } from 'wagmi';

  const connectors = [injected()];

  export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
    const { chains } = useAvailableChains();
    const wagmi = useRef<Config>();

  if (!wagmi.current) {
  wagmi.current = createConfig({
  chains: [mainnet],
  client({ chain }) {
  return createClient({ chain, transport: http() });
  },
  ssr: true,
  });
  }

  useSyncWagmiConfig(wagmi.current, connectors, chains);

  return (

  <WagmiProvider config={wagmi.current} reconnectOnMount={false}>
    {children}
  </WagmiProvider>
  ); };

  ```

  ```typescript WidgetPage.tsx theme={"system"}
  import { LiFiWidget } from '@lifi/widget';
  import { WalletProvider } from '../providers/WalletProvider';

  export const WidgetPage = () => {
    return (
      <WalletProvider>
        <LiFiWidget integrator="wagmi-example" />
      </WalletProvider>
    );
  };
  ```
</CodeGroup>

Please check out our complete examples in the widget repository [here](https://github.com/lifinance/widget/tree/main/examples).

### Support for Ethers.js and other alternatives

Developers can still use Ethers.js or any other alternative library in their project and convert `Signer`/`Provider` objects to Wagmi's [injected](https://wagmi.sh/react/api/connectors/injected) connector before wrapping the Widget with [WagmiProvider](https://wagmi.sh/react/api/WagmiProvider).

## SVM wallet connection

To manage wallet connections to SVM (Solana Virtual Machine) chains the widget uses the [Solana Wallet Standard](https://github.com/anza-xyz/wallet-standard) library.

If you already manage wallets using Solana Wallet Standard library in your dApp and the Widget detects that it is wrapped in [ConnectionProvider](https://solana.com/developers/cookbook/wallets/connect-wallet-react) and [WalletProvider](https://solana.com/developers/cookbook/wallets/connect-wallet-react) it will start re-using your wallet management without any additional configuration.

The example below shows how to preconfigure a basic wallet management for SVM.

<CodeGroup>
  ```typescript SolanaWalletProvider.tsx theme={"system"}
  import type { Adapter } from "@solana/wallet-adapter-base";
  import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
  import {
    ConnectionProvider,
    WalletProvider,
  } from "@solana/wallet-adapter-react";
  import { clusterApiUrl } from "@solana/web3.js";
  import type { FC, PropsWithChildren } from "react";

  const endpoint = clusterApiUrl(WalletAdapterNetwork.Mainnet);
  /**
   * Wallets that implement either of these standards will be available automatically.
   *
   *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
   *     (https://github.com/solana-mobile/mobile-wallet-adapter)
   *   - Solana Wallet Standard
   *     (https://github.com/solana-labs/wallet-standard)
   *
   * If you wish to support a wallet that supports neither of those standards,
   * instantiate its legacy wallet adapter here. Common legacy adapters can be found
   * in the npm package `@solana/wallet-adapter-wallets`.
   */
  const wallets: Adapter[] = [];

  export const SolanaWalletProvider: FC<PropsWithChildren> = ({ children }) => {
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          {children}
        </WalletProvider>
      </ConnectionProvider>
    );
  };
  ```

  ```typescript WidgetPage.tsx theme={"system"}
  import { LiFiWidget } from "@lifi/widget";
  import { WalletProvider } from "../providers/SolanaWalletProvider";

  export const WidgetPage = () => {
    return (
      <SolanaWalletProvider>
        <LiFiWidget integrator="solana-example" />
      </SolanaWalletProvider>
    );
  };
  ```
</CodeGroup>

## MVM wallet connection

To manage wallet connections to MVM (Move Virtual Machine) chains like SUI, the widget uses the [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit) for wallet management and [@mysten/sui](https://sdk.mystenlabs.com/typescript) for SUI blockchain interactions.

If you already manage wallets using [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit) in your dApp and the Widget detects that it is wrapped in [SuiClientProvider](https://sdk.mystenlabs.com/dapp-kit/sui-client-provider) and [WalletProvider](https://sdk.mystenlabs.com/dapp-kit/wallet-provider), it will start re-using your wallet management without any additional configuration.

The example below shows how to preconfigure a basic wallet management for MVM chains.

<CodeGroup>
  ```typescript SuiWalletProvider.tsx theme={"system"}
  import type { FC, PropsWithChildren } from "react";
  import {
    createNetworkConfig,
    SuiClientProvider,
    WalletProvider,
  } from "@mysten/dapp-kit";
  import { getFullnodeUrl } from "@mysten/sui/client";

  const { networkConfig } = createNetworkConfig({
    mainnet: { url: getFullnodeUrl("mainnet") },
  });

  export const SuiWalletProvider: FC<PropsWithChildren> = ({ children }) => {
    return (
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    );
  };
  ```

  ```typescript WidgetPage.tsx theme={"system"}
  import { LiFiWidget } from "@lifi/widget";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { SuiWalletProvider } from "../providers/SuiWalletProvider";

  const queryClient = new QueryClient();

  export const WidgetPage = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <SuiWalletProvider>
          <LiFiWidget integrator="sui-example" />
        </SuiWalletProvider>
      </QueryClientProvider>
    );
  };
  ```
</CodeGroup>

## UTXO(Bitcoin) wallet connection

To manage wallet connections and chain interactions with UTXO chains like Bitcoin, the widget uses the [Bigmi](https://github.com/lifinance/bigmi) library.

If you already manage wallets using [Bigmi](https://github.com/lifinance/bigmi) in your dApp and the widget detects that it is wrapped in [BigmiProvider](https://github.com/lifinance/bigmi/blob/main/docs/react/index.md#provider), it will start re-using your wallet management without any additional configuration.

The example below shows how to preconfigure a basic wallet management for Bitcoin.

<CodeGroup>
  ```typescript WidgetPage.tsx theme={"system"}
  import type { Config, CreateConnectorFn } from '@bigmi/client'
  import {
    createConfig,
    phantom,
    unisat,
    xverse,
  } from '@bigmi/client'
  import { bitcoin, createClient, http } from '@bigmi/core'
  import { BigmiProvider } from '@bigmi/react'

  const connectors: CreateConnectorFn[] = [phantom(), unisat(), xverse()]

  const config = createConfig({
  chains: [bitcoin],
  connectors,
  client({ chain }) {
  return createClient({ chain, transport: http() })
  }
  }) as Config

  export const WidgetPage: FC<PropsWithChildren> = ({ children }) => {
    return (
      <BigmiProvider config={config} reconnectOnMount>
        <LiFiWidget integrator="bigmi-example" />
      </BigmiProvider>
    );
  };

  ```
</CodeGroup>

## Configuration

There are additional configurations to smooth integration for external wallet management or in case of internal one provide options for WalletConnect and Coinbase Wallet.

```typescript  theme={"system"}
interface WidgetWalletConfig {
  onConnect(): void;
  walletConnect?: WalletConnectParameters;
  coinbase?: CoinbaseWalletParameters;
}

interface WidgetConfig {
  // ...
  walletConfig?: WidgetWalletConfig;
}
```

### Connect wallet button

Using internal wallet management clicking the `Connect wallet` button triggers the opening of an internal wallet menu. In cases where external wallet management is used we provide `onConnect` configuration option. This option allows developers to specify a callback function that will be executed when the `Connect wallet` button is clicked.

Please see modified RainbowKit example below. Here we use `openConnectModal` function provided by `useConnectModal` hook to open RainbowKit wallet menu when the `Connect wallet` button is clicked.

<CodeGroup>
  ```typescript WidgetPage.tsx theme={"system"}
  import { LiFiWidget } from "@lifi/widget";
  import { useConnectModal } from "@rainbow-me/rainbowkit";
  import { WalletProvider } from "../providers/WalletProvider";

  export const WidgetPage = () => {
    const { openConnectModal } = useConnectModal();
    return (
      <WalletProvider>
        <LiFiWidget
          integrator="wagmi-example"
          config={{
            walletConfig: {
              onConnect() {
                openConnectModal?.();
              },
            },
          }}
        />
      </WalletProvider>
    );
  };
  ```

  ```typescript WalletProvider.tsx theme={"system"}
  import { formatChain, useAvailableChains } from "@lifi/widget";
  import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
  import { useMemo, type FC, type PropsWithChildren } from "react";
  import type { Chain } from "viem";
  import { WagmiProvider } from "wagmi";
  import { mainnet } from "wagmi/chains";

  export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
    const { chains } = useAvailableChains();

    const wagmiConfig = useMemo(() => {
      const _chains: [Chain, ...Chain[]] = chains?.length
        ? (chains.map(formatChain) as [Chain, ...Chain[]])
        : [mainnet];

      // Wagmi currently doesn't support updating the config after its creation,
      // so in order to keep the dynamic chains list updated, we need to
      // re-create a config every time the chains list changes.
      const wagmiConfig = getDefaultConfig({
        appName: "LI.FI Widget Example",
        chains: _chains,
        projectId: "Your WalletConnect ProjectId",
        ssr: !chains?.length,
      });

      return wagmiConfig;
    }, [chains]);

    return (
      <WagmiProvider
        config={wagmiConfig}
        reconnectOnMount={Boolean(chains?.length)}
      >
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </WagmiProvider>
    );
  };
  ```
</CodeGroup>

### WalletConnect and Coinbase Wallet

We provide additional configuration for WalletConnect and Coinbase Wallet Wagmi connectors so when using built-in wallet management in the widget you can set WalletConnect's `projectId` or Coinbase Wallet's `appName` parameters.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  walletConfig: {
    walletConnect: {
      projectId: "Your Wallet Connect Project Id",
    },
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

### Partial Wallet Management

Your external wallet management may not support all ecosystems provided by our widget, or you may be in the process of migrating to a new setup. To help with these cases, we've got you covered!

The `usePartialWalletManagement` configuration option allows the widget to offer partial wallet management functionality. When enabled, this option provides a hybrid approach, effectively combining both external and internal wallet management.

In partial mode, external wallet management is used for "opt-out" providers, while internal management applies to any remaining providers that do not opt out. This setup creates a flexible balance between the integrator’s custom wallet menu and the widget’s native wallet menu, ensuring a smooth user experience across all ecosystems, even if external support is incomplete or in transition.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  walletConfig: {
    usePartialWalletManagement: true,
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

<Frame caption="Partial wallet management example">
  <img src="https://mintcdn.com/lifi/08FOM1AsMmrVbIEl/images/partial_wallet_management.gif?s=42f2c613ba637ce29d4abcbd546d3e42" data-og-width="474" width="474" data-og-height="604" height="604" data-path="images/partial_wallet_management.gif" data-optimize="true" data-opv="3" />
</Frame>

As shown in the example above, this setup allows both the integrator's and the widget's wallet menus to operate together, each supporting different ecosystems. In the example, RainbowKit manages EVM wallet support, while the internal wallet menu handles Solana and Bitcoin.

### Force Internal Wallet Management

The widget automatically detects existing wallet contexts (e.g., WagmiContext for EVM) higher up in your React tree. When found, it disables its own wallet management for that ecosystem and
uses your existing setup instead.

To override this behavior and force the widget to manage all wallets internally, set `forceInternalWalletManagement: true`. This ignores all external wallet contexts, for every ecosystem.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  walletConfig: {
    forceInternalWalletManagement: true,
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

### Ecosystem order for wallets

The `walletEcosystemsOrder` option allows you to define the preferred order of ecosystems (e.g., EVM, SVM) for each multichain wallet.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from "@lifi/widget";
import { ChainType } from "@lifi/sdk";

const widgetConfig: WidgetConfig = {
  walletConfig: {
    walletEcosystemsOrder: {
      MetaMask: [ChainType.EVM, ChainType.SVM],
      Phantom: [ChainType.SVM, ChainType.EVM],
    },
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

The keys (e.g., "MetaMask", "Phantom") must match the wallet names as labeled in the Widget UI. The associated array specifies the priority of ecosystems for that wallet, with any unlisted ecosystems shown afterward. This setting only affects the display order in the UI and does not limit actual ecosystem support.

### Smart Accounts Compatibility

When using the LI.FI Widget with smart accounts and smart account providers like Privy, Dynamic, ZeroDev, and others, you may encounter compatibility issues related to signature formats.

Smart accounts often use different signature standards than traditional Externally Owned Accounts (EOAs):

* **EOAs** use ECDSA signatures for standard transactions
* **Smart Accounts** may use ERC-1271 or other signature validation methods

This difference can cause incompatibility with native permit functionality (EIP-2612) that the widget uses for gasless token approvals. When smart accounts cannot produce the expected ECDSA signature format for permit transactions, the widget may encounter errors (like `Invalid yParityOrV value`) during execution.

#### EIP-5792 Transaction Batching Support

If your smart account provider or implementation supports [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) (Wallet Function Call API), there should be no compatibility issues. EIP-5792 enables transaction batching, allowing multiple operations (like token approvals and swaps) to be bundled into a single batch transaction. This eliminates the need for separate permit signatures and provides a smoother UX.

When EIP-5792 is available, the widget will automatically use batch transactions instead of individual permit signatures, resolving smart account compatibility issues.

#### Disabling Message Signing

For smart accounts that don't support EIP-5792 or when encountering signature-related errors, you can disable message signing by configuring the `disableMessageSigning` option in the SDK configuration. This will prevent the widget from attempting to use incompatible permit-based approvals that require message signing.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: WidgetConfig = {
  sdkConfig: {
    executionOptions: {
      disableMessageSigning: true,
    },
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

<Note>
  Disabling message signing will fallback to standard token approval
  transactions, which may require additional gas fees but ensures compatibility
  with all smart account implementations.
</Note>

For more details about execution options, see the [Execute Routes documentation](/sdk/execute-routes#disablemessagesigning).

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Internationalization

> Unlock global communities with effortless internationalization support

**LI.FI Widget** supports internationalization (i18n) and, with the help of our community, is translated into multiple languages to provide a localized user experience to your users, making it easier for them to understand and interact with the widget.

See supported languages and help us translate by [**joining**](https://crowdin.com/project/lifi-widget) our translation projects on [**Crowdin**](https://crowdin.com/project/lifi-widget):

![https://crowdin.com/project/lifi-widget](https://badges.crowdin.net/lifi-widget/localized.svg)

## Configure languages

By default, the widget is in English. You can configure the default language, which languages you want to show inside the widget, or in which language your users can see the widget if you hide the in-built language selection.

There are `allow`, `deny`, and `default` options for language configuration.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
  // hide the language selection part of the UI
  // hiddenUI: ['language'],
  languages: {
    // default to German
    default: 'de',
    // allow German and Spanish languages only
    allow: ['de', 'es'],
    // disable Chinese from being shown in the languages list
    // deny: ['zh'],
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

## Language Resources

You can customize the widget to support any language that your dApp needs by providing language resources.

Rather than trying to add a language via config, it's best to first consider helping us to translate the language you need by joining our [Crowdin translation project](https://crowdin.com/project/lifi-widget). 🙂

<CodeGroup>
  ```typescript widget.tsx theme={"system"}
  import { LiFiWidget, WidgetConfig } from '@lifi/widget';
  import es from './i18n/es.json';

  const widgetConfig: WidgetConfig = {
    languageResources: {
      es,
    },
  };

  export const WidgetPage = () => {
    return (
      <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
    );
  };
  ```

  ```json i18n/es.json theme={"system"}
  {
    "language": {
      "name": "Español",
      "title": "Idioma"
    }
  }
  ```
</CodeGroup>

Also, you can customize the existing language resources if you want to adjust some text. Find the complete list of key-value pairs in the reference `en.json` in our repository [here](https://github.com/lifinance/widget/blob/main/packages/widget/src/i18n/en.json).

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
  languageResources: {
    en: {
      button: { swap: 'Test swap' },
    },
  },
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
  );
};
```

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Widget API Reference

> API documentation for the widget components and hooks.

## Widget Component

Properties and types of the `LiFiWidget` component configuration.

## Core Configuration

| Name         | Type     | Default | Example      | Description                                 |
| ------------ | -------- | ------- | ------------ | ------------------------------------------- |
| `apiKey`     | `string` | –       | `integrator` | API authentication key                      |
| `integrator` | `string` | –       | `OpenSea`    | Identifier of the integrator (dApp/company) |
| `referrer`   | `string` | –       | –            | Identifier of the referrer                  |
| `fee`        | `number` | `0.05`  | –            | Float between 0 and 1 (e.g. 0.1 = 10% fee)  |

***

## Swap Details

| Name                  | Type        | Default | Example          | Description                        |
| --------------------- | ----------- | ------- | ---------------- | ---------------------------------- |
| `fromChain`           | `number`    | –       | `42161`          | Source chain ID                    |
| `fromToken`           | `string`    | –       | `0x539b...0342`  | Token contract address (source)    |
| `fromAmount`          | `number`    | `0`     | `69.42`          | Token amount to swap               |
| `toChain`             | `number`    | `1`     | `137`            | Destination chain ID               |
| `toToken`             | `string`    | –       | `0xd6df...1c90b` | Destination token contract address |
| `toAddress`           | `ToAddress` | –       | `0x2b56...1401`  | Destination wallet address         |
| `slippage`            | `number`    | `0.005` | –                | Default slippage setting           |
| `useRecommendedRoute` | `boolean`   | `false` | `true`           | Show only recommended route        |

***

## Routing & Filtering Options

| Name            | Type                                               | Default      | Example | Description                        |
| --------------- | -------------------------------------------------- | ------------ | ------- | ---------------------------------- |
| `routePriority` | `'CHEAPEST' \| 'FASTEST'`                          | `'CHEAPEST'` | –       | Route selection priority           |
| `chains`        | `{ allow?: number[]; deny?: number[] }`            | –            | –       | Allowed or denied chains           |
| `tokens`        | `{ featured?, include?, popular?, allow?, deny? }` | –            | –       | Token filtering and prioritization |
| `bridges`       | `{ allow?: string[]; deny?: string[] }`            | –            | –       | Bridge control list                |
| `exchanges`     | `{ allow?: string[]; deny?: string[] }`            | –            | –       | Exchange control list              |

***

## UI Appearance & Behavior

| Name                | Type                                           | Default     | Example                       | Description                     |
| ------------------- | ---------------------------------------------- | ----------- | ----------------------------- | ------------------------------- |
| `variant`           | `'compact' \| 'wide' \| 'drawer'`              | `'compact'` | –                             | Widget layout style             |
| `subvariant`        | `'default' \| 'split' \| 'refuel' \| 'custom'` | `'default'` | –                             | Additional layout customization |
| `appearance`        | `'light' \| 'dark' \| 'auto'`                  | `'auto'`    | `'dark'`                      | Theme mode                      |
| `disabledUI`        | `DisabledUIType[]`                             | –           | `['fromAmount', 'toAddress']` | UI parts to disable             |
| `hiddenUI`          | `HiddenUIType[]`                               | –           | `['appearance', 'language']`  | UI parts to hide                |
| `requiredUI`        | `RequiredUIType[]`                             | –           | `['toAddress']`               | Required UI fields              |
| `theme`             | `ThemeConfig`                                  | –           | –                             | Theme palette and typography    |
| `languages`         | `{ default?, allow?, deny? }`                  | –           | –                             | Language preferences            |
| `languageResources` | `LanguageResources`                            | –           | –                             | Custom i18n translations        |

***

## Integration Hooks & State

| Name           | Type                                                               | Default | Example | Description                          |
| -------------- | ------------------------------------------------------------------ | ------- | ------- | ------------------------------------ |
| `walletConfig` | `WidgetWalletConfig`                                               | –       | –       | Options to manage wallet state       |
| `sdkConfig`    | `WidgetSDKConfig`                                                  | –       | –       | SDK-specific configuration           |
| `formRef`      | `MutableRefObject<FormState \| null>`                              | –       | –       | Access for programmatic form updates |
| `buildUrl`     | `boolean`                                                          | `false` | –       | Append widget config to page URL     |
| `explorerUrls` | `Record<number, string[]> & Partial<Record<'internal', string[]>>` | –       | –       | Custom block explorer links          |

