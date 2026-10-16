import { Product, Master, Order, HomeQuote } from './models';
import { ReferenceCheckResult } from '../types';

interface RefEntry {
  entityType: string;
  id: string;
  name: string;
  detail: string;
}

/**
 * Referential Integrity Engine.
 * Before deleting any entity, scans products/orders/quotes for references
 * and returns a detailed blocker list + suggested actions.
 */
export async function checkEntityReferences(
  entityType: string,
  entityId: string
): Promise<ReferenceCheckResult> {
  const references: RefEntry[] = [];
  const suggestedActions: string[] = [];
  let entityName = entityId;

  const master = await Master.findOne({ id: entityId }).lean();

  switch (entityType) {
    case 'category': {
      if (master) entityName = master.name;
      const catSlug = master?.slug;
      const matching = await Product.find({
        $or: [{ categoryId: entityId }, ...(catSlug ? [{ categoryId: catSlug }] : [])]
      }).lean();
      matching.forEach((p) => {
        references.push({
          entityType: 'Product',
          id: p.id,
          name: p.name,
          detail: `Product "${p.name}" is assigned to Category "${entityName}".`
        });
        suggestedActions.push(`First reassign or delete Product "${p.name}" (ID: ${p.id}).`);
      });
      break;
    }

    case 'species': {
      if (master) entityName = master.name;
      const matching = await Product.find({ speciesId: entityId }).lean();
      matching.forEach((p) => {
        references.push({
          entityType: 'Product',
          id: p.id,
          name: p.name,
          detail: `Product "${p.name}" uses Bamboo Species "${entityName}".`
        });
        suggestedActions.push(`First edit or delete Product "${p.name}" (ID: ${p.id}).`);
      });

      const quotes = await HomeQuote.find({ speciesId: entityId }).lean();
      quotes.forEach((q) => {
        references.push({
          entityType: 'Home Quote',
          id: q.id,
          name: `Quote for ${q.clientName}`,
          detail: `Inquiry by ${q.clientName} specifies Species "${entityName}".`
        });
        suggestedActions.push(`First delete or update Home Quote ID "${q.id}".`);
      });
      break;
    }

    case 'treatment': {
      if (master) entityName = master.name;
      const matching = await Product.find({ treatmentId: entityId }).lean();
      matching.forEach((p) => {
        references.push({
          entityType: 'Product',
          id: p.id,
          name: p.name,
          detail: `Product "${p.name}" specifies Treatment "${entityName}".`
        });
        suggestedActions.push(`First edit or delete Product "${p.name}" (ID: ${p.id}).`);
      });
      break;
    }

    case 'roof_style': {
      if (master) entityName = master.name;
      const quotes = await HomeQuote.find({ roofStyleId: entityId }).lean();
      quotes.forEach((q) => {
        references.push({
          entityType: 'Home Quote',
          id: q.id,
          name: `Quote for ${q.clientName}`,
          detail: `Inquiry by ${q.clientName} uses Roof Style "${entityName}".`
        });
        suggestedActions.push(`First update or delete Home Quote ID "${q.id}".`);
      });
      break;
    }

    case 'home_type': {
      const ht =
        master || (await Master.findOne({ type: 'home_type', code: entityId }).lean());
      if (ht) entityName = ht.name;
      const quotes = await HomeQuote.find({ homeTypeId: ht?.id || entityId }).lean();
      quotes.forEach((q) => {
        references.push({
          entityType: 'Home Quote',
          id: q.id,
          name: `Quote for ${q.clientName}`,
          detail: `Inquiry by ${q.clientName} relies on Home Type "${entityName}".`
        });
        suggestedActions.push(`First delete or update Home Quote ID "${q.id}".`);
      });
      break;
    }

    case 'storage_provider': {
      if (master) entityName = master.name;
      break;
    }

    case 'product': {
      const prod = await Product.findOne({ id: entityId }).lean();
      if (prod) entityName = prod.name;
      const orders = await Order.find({ 'items.product.id': entityId }).lean();
      orders.forEach((ord) => {
        const foundItem = (ord.items || []).find((item: any) => item?.product?.id === entityId);
        references.push({
          entityType: 'Customer Order',
          id: ord.id,
          name: `Order ${ord.id} (${ord.customerName})`,
          detail: `Order ${ord.id} contains ${foundItem?.quantity || 1} unit(s) of Product "${entityName}".`
        });
        suggestedActions.push(`First archive or update Order "${ord.id}" before deleting product.`);
      });
      break;
    }

    case 'variant': {
      let varName = entityId;
      const parent = await Product.findOne({ 'variants.id': entityId }).lean();
      if (parent) {
        const v = (parent.variants || []).find((item: any) => item.id === entityId);
        if (v) varName = `${parent.name} - ${v.name}`;
      }
      entityName = varName;
      const orders = await Order.find({ 'items.variant.id': entityId }).lean();
      orders.forEach((ord) => {
        references.push({
          entityType: 'Customer Order',
          id: ord.id,
          name: `Order ${ord.id} (${ord.customerName})`,
          detail: `Order ${ord.id} contains Variant "${entityName}".`
        });
        suggestedActions.push(`First update or remove order item in Order "${ord.id}".`);
      });
      break;
    }
  }

  const canDelete = references.length === 0;
  return {
    canDelete,
    targetEntity: { type: entityType, id: entityId, name: entityName },
    references,
    suggestedActions,
    message: canDelete
      ? `Safe to delete ${entityType} "${entityName}". No active references found.`
      : `Cannot delete ${entityType} "${entityName}". It is currently referenced in ${references.length} active item(s).`
  };
}
