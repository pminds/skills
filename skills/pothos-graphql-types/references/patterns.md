# Pothos Boundary Patterns

Use these examples after the main skill has identified which boundary you are touching.

## Object Type Example

```ts
builder.objectType(ProductPrice, {
  name: "ProductPrice",
  fields: (t) => ({
    amount: t.exposeFloat("amount"),
    currency: t.exposeString("currency"),
  }),
});
```

## Loadable Node Example

This is the canonical `Product` definition referenced by the skill. Its `load` runs through the context runtime, and its `category` field returns a key the `Category` ref will load.

```ts
import { Effect } from "effect";

type ProductBacking = {
  id: ProductId;
  categoryId: CategoryId;
  name: string;
};

export const Product = builder.loadableNode("Product", {
  id: {
    resolve: ({ id }: ProductBacking) => id,
  },
  toKey: ({ id }) => id,
  sort: true,
  cacheResolved: true,
  load: (ids: Array<ProductBacking["id"]>, { runtime }) => {
    const program = Effect.fn("Product.load", {
      attributes: { "product.ids": ids },
    })(function* () {
      const products = yield* ProductClient;
      return yield* products.getProductsByIds({ ids });
    });

    return runtime.runPromise(program());
  },
  fields: (t) => ({
    name: t.exposeString("name"),
    category: t.field({
      type: Category,
      resolve: ({ categoryId }) => categoryId,
    }),
  }),
});
```

## Loader Key Example

When a field is typed as a loadable object or loadable Node, return the key when the parent already has it.

```ts
author: t.field({
  type: User,
  resolve: ({ authorId }) => authorId,
});
```

## Branded ID Example

```ts
import { Schema } from "effect";

export const ProductId = Schema.String.pipe(
  Schema.pattern(/^prod_[a-z0-9]+$/),
  Schema.brand("ProductId"),
);
export type ProductId = typeof ProductId.Type;
```

## Global ID Mutation Example

```ts
import { Effect, Schema } from "effect";

builder.mutationField("archiveProduct", (t) =>
  t.field({
    type: Product,
    args: {
      id: t.arg.globalID({ for: Product, required: true }),
    },
    resolve: (_, { id }, { runtime }) => {
      const program = Effect.gen(function* () {
        const productId = yield* Schema.decode(ProductId)(id.id);
        const products = yield* Products;
        return yield* products.archiveProduct({ id: productId });
      });

      return runtime.runPromise(program);
    },
  }),
);
```

## Compound ID Example

```ts
const encodeMembershipId = (input: {
  organizationId: OrganizationId;
  userId: UserId;
}) => `${input.organizationId}:${input.userId}`;

const decodeMembershipId = (id: string) => {
  const [organizationId, userId] = id.split(":");

  if (!organizationId || !userId) {
    throw new Error(`Invalid Membership id: ${id}`);
  }

  return {
    organizationId: parseOrganizationId(organizationId),
    userId: parseUserId(userId),
  };
};
```
