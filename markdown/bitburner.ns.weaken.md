<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [NS](./bitburner.ns.md) &gt; [weaken](./bitburner.ns.weaken.md)

## NS.weaken() method

Reduce a server's security level.

**Signature:**

```typescript
weaken(host: string, opts?: BasicHGWOptions): Promise<number>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  host | string | Hostname of the target server to weaken. |
|  opts | [BasicHGWOptions](./bitburner.basichgwoptions.md) | _(Optional)_ Optional parameters for configuring function behavior. |

**Returns:**

Promise&lt;number&gt;

The amount by which the target server’s security level was decreased. This is equivalent to 0.05 multiplied by the number of script threads.

## Remarks

RAM cost: 0.15 GB

Use your hacking skills to attack a server’s security, lowering the server’s security level. The runtime for this function depends on your hacking level and the target server’s security level when this function is called. This function lowers the security level of the target server by 0.05.

Like [hack](./bitburner.ns.hack.md) and [grow](./bitburner.ns.grow.md)<!-- -->, `weaken` can be called on any server, regardless of where the script is running. This function requires root access to the target server, but there is no required hacking level to run the function.

## Example 1


```ts
// NS1:
var currentSecurity = getServerSecurityLevel("foodnstuff");
currentSecurity = currentSecurity - weaken("foodnstuff");
```

## Example 2


```ts
// NS2:
let currentSecurity = ns.getServerSecurityLevel("foodnstuff");
currentSecurity -= await ns.weaken("foodnstuff");
```

