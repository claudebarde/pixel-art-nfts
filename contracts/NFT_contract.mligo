# 1 "ligo/src/fa2_fixed_collection_token.mligo"
(**
Defines non-mutable NFT collection. Once the contract is created, no tokens can
be minted or burned.
Metadata may/should contain URLs for token images and images hashes.
 *)





# 1 "ligo/src/fa2_interface.mligo" 1



type token_id = string

type transfer_destination = {
  to_ : address;
  token_id : token_id;
  amount : nat;
}

type transfer_destination_michelson = transfer_destination michelson_pair_right_comb

type transfer = {
  from_ : address;
  txs : transfer_destination list;
}

type transfer_aux = {
  from_ : address;
  txs : transfer_destination_michelson list;
}

type transfer_michelson = transfer_aux michelson_pair_right_comb

type balance_of_request = {
  owner : address;
  token_id : token_id;
}

type balance_of_request_michelson = balance_of_request michelson_pair_right_comb

type balance_of_response = {
  request : balance_of_request;
  balance : nat;
}

type balance_of_response_aux = {
  request : balance_of_request_michelson;
  balance : nat;
}

type balance_of_response_michelson = balance_of_response_aux michelson_pair_right_comb

type balance_of_param = {
  requests : balance_of_request list;
  callback : (balance_of_response_michelson list) contract;
}

type balance_of_param_aux = {
  requests : balance_of_request_michelson list;
  callback : (balance_of_response_michelson list) contract;
}

type balance_of_param_michelson = balance_of_param_aux michelson_pair_right_comb

type operator_param = {
  owner : address;
  operator : address;
}

type operator_param_michelson = operator_param michelson_pair_right_comb

type update_operator =
  | Add_operator_p of operator_param
  | Remove_operator_p of operator_param

type update_operator_aux =
  | Add_operator of operator_param_michelson
  | Remove_operator of operator_param_michelson

type update_operator_michelson = update_operator_aux michelson_or_right_comb

type token_metadata = {
  token_id : token_id;
  symbol : string;
  name : string;
  decimals : nat;
  price: tez;
  market: bool; (* true if available on market, false for manual transfers *)
  extras : (string, string) map;
}

type token_metadata_michelson = token_metadata michelson_pair_right_comb

type token_metadata_param = {
  token_ids : token_id list;
  handler : (token_metadata_michelson list) -> unit;
}

type token_metadata_param_michelson = token_metadata_param michelson_pair_right_comb

type token_format = { check: bool; initial: string; length: nat }
type token_format_michelson = token_format michelson_pair_right_comb

type fa2_entry_points =
  | Transfer of transfer_michelson list
  | Balance_of of balance_of_param_michelson
  | Update_operators of update_operator_michelson list
  | Token_metadata_registry of address contract
  | Mint_token of address * token_metadata_michelson
  | Burn_token of token_id
  | Buy_tokens of token_id list
  | Update_market_fee of tez
  | Update_token_price of token_id * tez
  | Update_token_status of token_id * bool
  | Withdraw_revenue of unit
  | Withdraw_revenue_from_fee of unit
  | Update_token_format of token_format_michelson
  | Pause of bool


type fa2_token_metadata =
  | Token_metadata of token_metadata_param_michelson

(* permission policy definition *)

type operator_transfer_policy =
  | No_transfer
  | Owner_transfer
  | Owner_or_operator_transfer

type operator_transfer_policy_michelson = operator_transfer_policy michelson_or_right_comb

type owner_hook_policy =
  | Owner_no_hook
  | Optional_owner_hook
  | Required_owner_hook

type owner_hook_policy_michelson = owner_hook_policy michelson_or_right_comb

type custom_permission_policy = {
  tag : string;
  config_api: address option;
}

type custom_permission_policy_michelson = custom_permission_policy michelson_pair_right_comb

type permissions_descriptor = {
  operator : operator_transfer_policy;
  receiver : owner_hook_policy;
  sender : owner_hook_policy;
  custom : custom_permission_policy option;
}

type permissions_descriptor_aux = {
  operator : operator_transfer_policy_michelson;
  receiver : owner_hook_policy_michelson;
  sender : owner_hook_policy_michelson;
  custom : custom_permission_policy_michelson option;
}

type permissions_descriptor_michelson = permissions_descriptor_aux michelson_pair_right_comb

(* permissions descriptor entry point
type fa2_entry_points_custom =
  ...
  | Permissions_descriptor of permissions_descriptor_michelson contract

*)


type transfer_destination_descriptor = {
  to_ : address option;
  token_id : token_id;
  amount : nat;
}

type transfer_destination_descriptor_michelson =
  transfer_destination_descriptor michelson_pair_right_comb

type transfer_descriptor = {
  from_ : address option;
  txs : transfer_destination_descriptor list
}

type transfer_descriptor_aux = {
  from_ : address option;
  txs : transfer_destination_descriptor_michelson list
}

type transfer_descriptor_michelson = transfer_descriptor_aux michelson_pair_right_comb

type transfer_descriptor_param = {
  batch : transfer_descriptor list;
  operator : address;
}

type transfer_descriptor_param_aux = {
  batch : transfer_descriptor_michelson list;
  operator : address;
}

type transfer_descriptor_param_michelson = transfer_descriptor_param_aux michelson_pair_right_comb
(*
Entry points for sender/receiver hooks

type fa2_token_receiver =
  ...
  | Tokens_received of transfer_descriptor_param_michelson

type fa2_token_sender =
  ...
  | Tokens_sent of transfer_descriptor_param_michelson
*)



# 11 "ligo/src/fa2_fixed_collection_token.mligo" 2

# 1 "ligo/src/fa2_errors.mligo" 1



(** One of the specified `token_id`s is not defined within the FA2 contract *)
let fa2_token_undefined = "FA2_TOKEN_UNDEFINED" 
(** 
A token owner does not have sufficient balance to transfer tokens from
owner's account 
*)
let fa2_insufficient_balance = "FA2_INSUFFICIENT_BALANCE"
(** A transfer failed because of `operator_transfer_policy == No_transfer` *)
let fa2_tx_denied = "FA2_TX_DENIED"
(** 
A transfer failed because `operator_transfer_policy == Owner_transfer` and it is
initiated not by the token owner 
*)
let fa2_not_owner = "FA2_NOT_OWNER"
(**
A transfer failed because `operator_transfer_policy == Owner_or_operator_transfer`
and it is initiated neither by the token owner nor a permitted operator
 *)
let fa2_not_operator = "FA2_NOT_OPERATOR"
(** 
`update_operators` entry point is invoked and `operator_transfer_policy` is
`No_transfer` or `Owner_transfer`
*)
let fa2_operators_not_supported = "FA2_OPERATORS_UNSUPPORTED"
(**
Receiver hook is invoked and failed. This error MUST be raised by the hook
implementation
 *)
let fa2_receiver_hook_failed = "FA2_RECEIVER_HOOK_FAILED"
(**
Sender hook is invoked and failed. This error MUST be raised by the hook
implementation
 *)
let fa2_sender_hook_failed = "FA2_SENDER_HOOK_FAILED"
(**
Receiver hook is required by the permission behavior, but is not implemented by
a receiver contract
 *)
let fa2_receiver_hook_undefined = "FA2_RECEIVER_HOOK_UNDEFINED"
(**
Sender hook is required by the permission behavior, but is not implemented by
a sender contract
 *)
let fa2_sender_hook_undefined = "FA2_SENDER_HOOK_UNDEFINED"



# 12 "ligo/src/fa2_fixed_collection_token.mligo" 2

# 1 "ligo/src/fa2_operator_lib.mligo" 1
(** 
Reference implementation of the FA2 operator storage, config API and 
helper functions 
*)





# 1 "ligo/src/fa2_convertors.mligo" 1
(**
Helper function to convert FA2 entry points input parameters between their
Michelson and internal LIGO representation.

FA2 contract implementation must conform to the Michelson entry points interface
outlined in the FA2 standard for interoperability with other contracts and off-chain
tools.
 *)





# 1 "ligo/src/fa2_interface.mligo" 1
















































































































































































































# 14 "ligo/src/fa2_convertors.mligo" 2

let permissions_descriptor_to_michelson (d : permissions_descriptor)
    : permissions_descriptor_michelson =
  let aux : permissions_descriptor_aux = {
    operator = Layout.convert_to_right_comb d.operator;
    receiver = Layout.convert_to_right_comb d.receiver;
    sender = Layout.convert_to_right_comb d.sender;
    custom = match d.custom with
    | None -> (None : custom_permission_policy_michelson option)
    | Some c -> Some (Layout.convert_to_right_comb c)
  } in
  Layout.convert_to_right_comb (aux : permissions_descriptor_aux)

let transfer_descriptor_to_michelson (p : transfer_descriptor) : transfer_descriptor_michelson =
  let aux : transfer_descriptor_aux = {
    from_ = p.from_;
    txs = List.map 
      (fun (tx : transfer_destination_descriptor) ->
        Layout.convert_to_right_comb tx
      )
      p.txs;
  } in
  Layout.convert_to_right_comb (aux : transfer_descriptor_aux)

let transfer_descriptor_param_to_michelson (p : transfer_descriptor_param)
    : transfer_descriptor_param_michelson =
  let aux : transfer_descriptor_param_aux = {
    operator = p.operator;
    batch = List.map  transfer_descriptor_to_michelson p.batch;
  } in
  Layout.convert_to_right_comb (aux : transfer_descriptor_param_aux)

let transfer_descriptor_from_michelson (p : transfer_descriptor_michelson) : transfer_descriptor =
  let aux : transfer_descriptor_aux = Layout.convert_from_right_comb p in
  {
    from_ = aux.from_;
    txs = List.map
      (fun (txm : transfer_destination_descriptor_michelson) ->
        let tx : transfer_destination_descriptor =
          Layout.convert_from_right_comb txm in
        tx
      )
      aux.txs;
  }

let transfer_descriptor_param_from_michelson (p : transfer_descriptor_param_michelson)
    : transfer_descriptor_param =
  let aux : transfer_descriptor_param_aux = Layout.convert_from_right_comb p in
  let b : transfer_descriptor list =
    List.map transfer_descriptor_from_michelson aux.batch
  in
  {
    operator = aux.operator;
    batch = b;
  }

let transfer_from_michelson (txm : transfer_michelson) : transfer =
  let aux : transfer_aux = Layout.convert_from_right_comb txm in 
  {
    from_ = aux.from_;
    txs = List.map
      (fun (txm : transfer_destination_michelson) ->
        let tx : transfer_destination = Layout.convert_from_right_comb txm in
        tx
      )
      aux.txs;
  }

let transfers_from_michelson (txsm : transfer_michelson list) : transfer list =
  List.map transfer_from_michelson txsm

let transfer_to_michelson (tx : transfer) : transfer_michelson =
  let aux : transfer_aux = {
    from_ = tx.from_;
    txs = List.map 
      (fun (tx: transfer_destination) -> 
        let t : transfer_destination_michelson = Layout.convert_to_right_comb tx in
        t
      ) tx.txs;
  } in
  Layout.convert_to_right_comb (aux : transfer_aux)

let transfers_to_michelson (txs : transfer list) : transfer_michelson list =
  List.map transfer_to_michelson txs

let operator_param_from_michelson (p : operator_param_michelson) : operator_param =
  let op : operator_param = Layout.convert_from_right_comb p in
  op

let operator_param_to_michelson (p : operator_param) : operator_param_michelson =
  Layout.convert_to_right_comb p

let operator_update_from_michelson (uom : update_operator_michelson) : update_operator =
    let aux : update_operator_aux = Layout.convert_from_right_comb uom in
    match aux with
    | Add_operator opm -> Add_operator_p (operator_param_from_michelson opm)
    | Remove_operator opm -> Remove_operator_p (operator_param_from_michelson opm)

let operator_update_to_michelson (uo : update_operator) : update_operator_michelson =
    let aux = match uo with
    | Add_operator_p op -> Add_operator (operator_param_to_michelson op)
    | Remove_operator_p op -> Remove_operator (operator_param_to_michelson op)
    in
    Layout.convert_to_right_comb aux

let operator_updates_from_michelson (updates_michelson : update_operator_michelson list)
    : update_operator list =
  List.map operator_update_from_michelson updates_michelson

let balance_of_param_from_michelson (p : balance_of_param_michelson) : balance_of_param =
  let aux : balance_of_param_aux = Layout.convert_from_right_comb p in
  let requests = List.map 
    (fun (rm : balance_of_request_michelson) ->
      let r : balance_of_request = Layout.convert_from_right_comb rm in
      r
    )
    aux.requests 
  in
  {
    requests = requests;
    callback = aux.callback;
  } 

let balance_of_param_to_michelson (p : balance_of_param) : balance_of_param_michelson =
  let aux : balance_of_param_aux = {
    requests = List.map 
      (fun (r : balance_of_request) -> Layout.convert_to_right_comb r)
      p.requests;
    callback = p.callback;
  } in
  Layout.convert_to_right_comb (aux : balance_of_param_aux)

let balance_of_response_to_michelson (r : balance_of_response) : balance_of_response_michelson =
  let aux : balance_of_response_aux = {
    request = Layout.convert_to_right_comb r.request;
    balance = r.balance;
  } in
  Layout.convert_to_right_comb (aux : balance_of_response_aux)

let balance_of_response_from_michelson (rm : balance_of_response_michelson) : balance_of_response =
  let aux : balance_of_response_aux = Layout.convert_from_right_comb rm in
  let request : balance_of_request = Layout.convert_from_right_comb aux.request in
  {
    request = request;
    balance = aux.balance;
  }

let token_metas_to_michelson (ms : token_metadata list) : token_metadata_michelson list =
  List.map
    ( fun (m : token_metadata) ->
      let mm : token_metadata_michelson = Layout.convert_to_right_comb m in
      mm
    ) ms


# 10 "ligo/src/fa2_operator_lib.mligo" 2

# 1 "ligo/src/fa2_errors.mligo" 1


















































# 11 "ligo/src/fa2_operator_lib.mligo" 2

(** 
(owner, operator) -> unit
To be part of FA2 storage to manage permitted operators
*)
type operator_storage = ((address * address), unit) big_map

(** 
  Updates operator storage using an `update_operator` command.
  Helper function to implement `Update_operators` FA2 entry point
*)
let update_operators (update, storage : update_operator * operator_storage)
    : operator_storage =
  match update with
  | Add_operator_p op -> 
    Big_map.update (op.owner, op.operator) (Some unit) storage
  | Remove_operator_p op -> 
    Big_map.remove (op.owner, op.operator) storage

(**
Validate if operator update is performed by the token owner.
@param updater an address that initiated the operation; usually `Tezos.sender`.
*)
let validate_update_operators_by_owner (update, updater : update_operator * address)
    : unit =
  let op = match update with
  | Add_operator_p op -> op
  | Remove_operator_p op -> op
  in
  if op.owner = updater then unit else failwith fa2_not_owner

(**
  Generic implementation of the FA2 `%update_operators` entry point.
  Assumes that only the token owner can change its operators.
 *)
let fa2_update_operators (updates_michelson, storage
    : (update_operator_michelson list) * operator_storage) : operator_storage =
  let updates = operator_updates_from_michelson updates_michelson in
  let updater = Tezos.sender in
  let process_update = (fun (ops, update : operator_storage * update_operator) ->
    let u = validate_update_operators_by_owner (update, updater) in
    update_operators (update, ops)
  ) in
  List.fold process_update updates storage

(**
Create an operator validator function based on provided operator policy.
@param tx_policy operator_transfer_policy defining the constrains on who can transfer.
 *)
let make_operator_validator (tx_policy : operator_transfer_policy)
    : (address * operator_storage)-> unit =
  let can_owner_tx, can_operator_tx = match tx_policy with
  | No_transfer -> (failwith fa2_tx_denied : bool * bool)
  | Owner_transfer -> true, false
  | Owner_or_operator_transfer -> true, true
  in
  let operator : address = Tezos.sender in
  (fun (owner, ops_storage : address * operator_storage) ->
      if can_owner_tx && owner = operator
      then unit
      else
        if not can_operator_tx
        then failwith fa2_not_owner
        else
          if Big_map.mem  (owner, operator) ops_storage
          then unit else failwith fa2_not_operator
  )

(**
Default implementation of the operator validation function.
The default implicit `operator_transfer_policy` value is `Owner_or_operator_transfer`
 *)
let make_default_operator_validator (operator : address)
    : (address * operator_storage)-> unit =
  (fun (owner, ops_storage : address * operator_storage) ->
      if owner = operator
      then unit
      else
        if Big_map.mem  (owner, operator) ops_storage
        then unit else failwith fa2_not_operator
  )

(** 
Validate operators for all transfers in the batch at once
@param tx_policy operator_transfer_policy defining the constrains on who can transfer.
*)
let validate_operator (tx_policy, txs, ops_storage 
    : operator_transfer_policy * (transfer list) * operator_storage) : unit =
  let validator = make_operator_validator tx_policy in
  List.iter (fun (tx : transfer) -> validator (tx.from_, ops_storage)) txs



# 13 "ligo/src/fa2_fixed_collection_token.mligo" 2


(* token_id -> token_metadata *)
type token_metadata_storage = (token_id, token_metadata_michelson) big_map

(*  token_id -> owner_address *)
type ledger = (token_id, address) big_map

type collection_storage = {
  ledger : ledger;
  operators : operator_storage;
  token_metadata : token_metadata_storage;
  revenues: (address, tez) big_map;
  market_fee: tez;
  revenue_from_fee: tez;
  admin: address;
  token_format_checker: token_format_michelson;
  pause: bool
}


# 1 "ligo/src/fa2_mint_burn_tokens.mligo" 1
let mint_token ((user, metadata, storage) : address * token_metadata_michelson * collection_storage)
 : collection_storage = 
    if Tezos.amount = storage.market_fee
    then
        let token_metadata: token_metadata = Layout.convert_from_right_comb metadata in
        let token_format: token_format = Layout.convert_from_right_comb storage.token_format_checker in
        (* Verifies the token format *)
        if token_format.check && 
            (String.length token_metadata.token_id <> token_format.length ||
            String.sub 0n 2n token_metadata.token_id <> token_format.initial)
        then (failwith "WRONG_TOKEN_FORMAT": collection_storage)
        else
            (* Checks if the token exists *)
            let new_ledger: ledger = match Big_map.find_opt token_metadata.token_id storage.ledger with
                | Some (token) -> (failwith "TOKEN_ID_EXISTS" : ledger)
                (* Adds the new token to the ledger *)
                | None -> Big_map.add token_metadata.token_id user storage.ledger in
            (* Adds token metadata in storage *)
            let new_token_metadata: token_metadata_storage = 
                Big_map.add token_metadata.token_id metadata storage.token_metadata in
            { storage with ledger = new_ledger ; token_metadata = new_token_metadata ; revenue_from_fee = storage.revenue_from_fee + Tezos.amount }
    else (failwith "WRONG_MARKET_FEE": collection_storage)

let burn_token ((token_id, storage): token_id * collection_storage): collection_storage = 
    (* Only owner and admin can burn tokens *)
    let owner: address = match Big_map.find_opt token_id storage.ledger with
        | None -> (failwith "UNKNOWN_TOKEN": address)
        | Some owner -> owner in
    if Tezos.sender = owner || Tezos.sender = storage.admin
    then
        (* Removes token from ledger big map and token metadata big map *)
        { storage with ledger = Big_map.remove token_id storage.ledger ; token_metadata = Big_map.remove token_id storage.token_metadata }
    else
        (failwith "UNAUTHORIZED OPERATION": collection_storage) 
# 34 "ligo/src/fa2_fixed_collection_token.mligo" 2

# 1 "ligo/src/fa2_buy_tokens.mligo" 1
let buy_tokens ((list_of_token_id, storage) : token_id list * collection_storage)
 : collection_storage = 
    let buy_token = (fun (storage, token_id: collection_storage * token_id) -> 
        (* checks if the token exists *)
        let token: token_metadata = match Big_map.find_opt token_id storage.token_metadata with
            | Some michelson_token -> 
                let t: token_metadata = Layout.convert_from_right_comb michelson_token in
                t
            | None -> (failwith "TOKEN_DOESNT_EXIST": token_metadata) in
        (* checks if the token is set for auto buying *)
        if token.market = true
        then 
            (* Checks if the amount matches the price*)
            if Tezos.amount >= token.price
            then 
                (* Proceeds with transfer *)
                let artist: address = match Big_map.find_opt token_id storage.ledger with
                    | Some artist -> artist
                    | None -> (failwith "UNKNOWN_ARTIST": address) in
                (* Updates owner's address in ledger *)
                let new_ledger: ledger = Big_map.update token_id (Some Tezos.sender) storage.ledger in
                (* Remove token from market to let new owner decide if they want to put it on the market *)
                let new_token = Layout.convert_to_right_comb { token with market = false } in
                let new_token_metadata = 
                    Big_map.update 
                        token_id 
                        (Some new_token) 
                        storage.token_metadata in
                (* Credits artist *)
                let new_revenues = match Big_map.find_opt artist storage.revenues with
                    | None -> Big_map.add artist Tezos.amount storage.revenues
                    | Some blc -> Big_map.update artist (Some (token.price + blc)) storage.revenues in
            
                { storage with ledger = new_ledger ; token_metadata = new_token_metadata ; revenues = new_revenues }
            else (failwith "INCORRECT_PRICE": collection_storage)
        else (failwith "UNAVAILABLE_TO_PURCHASE": collection_storage)
    ) in
        
    List.fold buy_token list_of_token_id storage
# 35 "ligo/src/fa2_fixed_collection_token.mligo" 2

# 1 "ligo/src/fa2_maintenance.mligo" 1
(* Admin updates market fee *)
let update_market_fee ((new_fee, storage) : tez * collection_storage)
 : collection_storage = 
    if Tezos.source = storage.admin
    then { storage with market_fee = new_fee }
    else (failwith "NOT_AN_ADMIN": collection_storage)

(* Artist updates token price *)
let update_token_price ((token_id, new_price, storage) : token_id * tez * collection_storage)
 : collection_storage = 
    (* Fetches artist's address from ledger *)
    let artist: address = match Big_map.find_opt token_id storage.ledger with
      | None -> (failwith "NO_TOKEN_FOUND": address)
      | Some addr -> addr in
   (* Only artist can update the price *)
   if Tezos.source = artist
   then 
      let metadata_michelson: token_metadata_michelson = match Big_map.find_opt token_id storage.token_metadata with
         | None -> (failwith "NO_TOKEN": token_metadata_michelson)
         | Some metadata_michelson -> metadata_michelson in
      let metadata: token_metadata = Layout.convert_from_right_comb metadata_michelson in
      let new_metadata: token_metadata_michelson = Layout.convert_to_right_comb { metadata with price = new_price } in
            
      { storage with token_metadata = Big_map.update token_id (Some new_metadata) storage.token_metadata }
   else (failwith "FORBIDDEN_UPDATE": collection_storage)

(* Artist updates token status from on market to off market *)
let update_token_status ((token_id, new_status, storage): token_id * bool * collection_storage)
   : collection_storage =
      (* Only artist is allowed to update the token status *)
      let artist: address = match Big_map.find_opt token_id storage.ledger with
         | None -> (failwith "NO_TOKEN_FOUND": address)
         | Some addr -> addr in
      if Tezos.source = artist
      then
         let metadata_michelson: token_metadata_michelson = match Big_map.find_opt token_id storage.token_metadata with
         | None -> (failwith "NO_TOKEN": token_metadata_michelson)
         | Some metadata_michelson -> metadata_michelson in
         let metadata: token_metadata = Layout.convert_from_right_comb metadata_michelson in
         let new_metadata: token_metadata_michelson = Layout.convert_to_right_comb { metadata with market = new_status} in

         { storage with token_metadata = Big_map.update token_id (Some new_metadata) storage.token_metadata }         
      else (failwith "FORBIDDEN_UPDATE": collection_storage)

(* Artist withdraws generated revenues *)
let withdraw_revenue (storage: collection_storage): operation list * collection_storage =
   (* Gets amount to be sent *)
   let revenue: tez = match Big_map.find_opt Tezos.source storage.revenues with
      | None -> (failwith "NO_ACCOUNT": tez)
      | Some blc -> blc in
   (* Prepares transaction to be sent *)
   let account: unit contract = match (Tezos.get_contract_opt Tezos.source : unit contract option) with
      | Some contract -> contract
      | None -> (failwith "NO_CONTRACT" : unit contract) in
   let payment: operation = Tezos.transaction unit revenue account in
   (* Set revenue for artist to 0 and returns transaction *)
   ([payment], { storage with revenues = Big_map.update Tezos.source (Some 0tez) storage.revenues })

(* Admin withdraws generated revenues *)
let withdraw_revenue_from_fee (storage: collection_storage): operation list * collection_storage =
   if Tezos.sender = storage.admin
   then
      (* Gets amount to be sent *)
      let revenue: tez = storage.revenue_from_fee in
      (* Prepares transaction to be sent *)
      let account: unit contract = match (Tezos.get_contract_opt storage.admin : unit contract option) with
         | Some contract -> contract
         | None -> (failwith "NO_CONTRACT" : unit contract) in
      let payment: operation = Tezos.transaction unit revenue account in
      (* Set revenue from fee to 0 and returns transaction *)
      ([payment], { storage with revenue_from_fee = 0mutez })
   else
      (failwith "UNAUTHORIZED_OPERATION": operation list * collection_storage) 

(* Admin updates token format data *)
let update_token_format ((new_format, storage): token_format_michelson * collection_storage): collection_storage =
   if Tezos.sender = storage.admin
   then
      { storage with token_format_checker = new_format }
   else
      (failwith "UNAUTHORIZED_OPERATION": collection_storage)

(* Admin pauses contract *)
let set_pause ((status, storage): bool * collection_storage): collection_storage =
   if Tezos.sender = storage.admin
   then
      { storage with pause = status }
   else
      (failwith "UNAUTHORIZED_OPERATION": collection_storage)
# 36 "ligo/src/fa2_fixed_collection_token.mligo" 2

(**
Update leger balances according to the specified transfers. Fails if any of the
permissions or constraints are violated.
@param txs transfers to be applied to the ledger
@param owner_validator function that validates of the tokens from the particular owner can be transferred. 
 *)
let transfer (txs, owner_validator, ops_storage, ledger
    : (transfer list) * ((address * operator_storage) -> unit) * operator_storage * ledger) : ledger =
  (* process individual transfer *)
  let make_transfer = (fun (l, tx : ledger * transfer) ->
    let u = owner_validator (tx.from_, ops_storage) in
    List.fold 
      (fun (ll, dst : ledger * transfer_destination) ->
        if dst.amount = 0n
        then ll (* zero amount transfer, do nothing *)
        else if dst.amount <> 1n (* for NFTs only one token per token type is available *)
        then (failwith fa2_insufficient_balance : ledger)
        else
          let owner = Big_map.find_opt dst.token_id ll in
          match owner with
          | None -> (failwith fa2_token_undefined : ledger)
          | Some o -> 
            if o <> tx.from_ (* check that from_ address actually owns the token *)
            then (failwith fa2_insufficient_balance : ledger)
            else Big_map.update dst.token_id (Some dst.to_) ll
      ) tx.txs l
  )
  in 
    
  List.fold make_transfer txs ledger

(** 
Retrieve the balances for the specified tokens and owners
@return callback operation
*)
let get_balance (p, ledger : balance_of_param * ledger) : operation =
  let to_balance = fun (r : balance_of_request) ->
    let owner = Big_map.find_opt r.token_id ledger in
    let response = match owner with
    | None -> (failwith fa2_token_undefined : balance_of_response)
    | Some o ->
      let bal = if o = r.owner then 1n else 0n in
      { request = r; balance = bal; }
    in
    balance_of_response_to_michelson response
  in
  let responses = List.map to_balance p.requests in
  Operation.transaction responses 0mutez p.callback

let main (param, storage : fa2_entry_points * collection_storage)
    :  (operation list) * collection_storage =
  match param with
  | Transfer txs_michelson ->
    if storage.pause
    then (failwith "PAUSED": operation list * collection_storage)
    else
      let txs = transfers_from_michelson txs_michelson in
      let validator = make_default_operator_validator Tezos.sender in
      let new_ledger = transfer (txs, validator, storage.operators, storage.ledger) in
      let new_storage = { storage with ledger = new_ledger; } in
      ([] : operation list), new_storage
  
  | Balance_of pm ->
    let p = balance_of_param_from_michelson pm in
    let op = get_balance (p, storage.ledger) in
    [op], storage

  | Update_operators updates_michelson ->
    let new_operators = fa2_update_operators (updates_michelson, storage.operators) in
    let new_storage = { storage with operators = new_operators; } in
    ([] : operation list), new_storage

  | Token_metadata_registry callback ->
    (* the contract stores its own token metadata and exposes `token_metadata` storage field *)
    let callback_op = Operation.transaction Tezos.self_address 0mutez callback in
    [callback_op], storage

  | Mint_token params ->
    if storage.pause
    then (failwith "PAUSED": operation list * collection_storage)
    else
      let new_storage = mint_token ((params.0, params.1, storage)) in
      ([] : operation list), new_storage

  | Burn_token param ->
    if storage.pause && Tezos.sender <> storage.admin
    then (failwith "PAUSED": operation list * collection_storage)
    else
      let new_storage = burn_token ((param, storage)) in
      ([] : operation list), new_storage

  | Buy_tokens params ->
    if storage.pause
    then (failwith "PAUSED": operation list * collection_storage)
    else
      let new_storage = buy_tokens ((params, storage)) in
      ([] : operation list), new_storage

  | Update_market_fee params ->
    let new_storage = update_market_fee ((params, storage)) in
    ([] : operation list), new_storage

  | Update_token_price params ->
    let new_storage = update_token_price ((params.0, params.1, storage)) in
    ([] : operation list), new_storage

  | Update_token_status params ->
    let new_storage = update_token_status ((params.0, params.1, storage)) in
    ([]: operation list), new_storage

  | Withdraw_revenue param ->
    if storage.pause
    then (failwith "PAUSED": operation list * collection_storage)
    else
      let (operations, new_storage) = withdraw_revenue (storage) in
      operations, new_storage

  | Withdraw_revenue_from_fee param ->
    let (operations, new_storage) = withdraw_revenue_from_fee (storage) in
    operations, new_storage

  | Update_token_format param ->
    let new_storage = update_token_format ((param, storage)) in
    ([]: operation list), new_storage

  | Pause param ->
    let new_storage = set_pause ((param, storage)) in
    ([]: operation list), new_storage


