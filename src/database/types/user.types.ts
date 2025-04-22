/* eslint-disable prettier/prettier */

export type Hub = {
    id: string;
    name: string;
    code: string;
    address: string;
    country_id: string;
    state_id: string;
    status: 'active' | 'inactive'; // Assuming status can be either 'active' or 'inactive'
    is_head: boolean;
    state: {
      id: string;
      code: string;
      name: string;
    };
    country: {
      id: string;
      code: string;
      name: string;
    };
    total_deliveries: number;
    total_shipments: number;
    created_at: string; // You can use `Date` if you parse it to a Date object
    updated_at: string;
  }
export type ProLoginResp = {
  ok: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
      department: string;
      role: string;
      web_token: {
        endpoint: string;
        expirationTime: string | null;
        keys: {
          p256dh: string;
          auth: string;
        };
      };
      android_token: string | null;
      ios_token: string | null;
      acl: string;
      scope: string | null;
      address: string;
      hub_id: string | null;
      zone_id: string | null;
      hub: Hub;
      state: string | null;
      country: string | null;
      zip: string;
      waybill_count: number;
      acls: Array<{
        id: string;
        uid: string;
        entity_id: string;
        scope: string | null;
        role: string;
        hub_id: string | null;
        hub: string | null;
        zone_id: string | null;
        name: string;
        created_at: string;
        push: {
          enabled: boolean;
          platform: string;
        };
      }>;
      status: string;
      created_at: string;
      updated_at: string;
    };
    auth: {
      token: string;
      refresh_token: string;
      expires: string;
    };
  };
};
