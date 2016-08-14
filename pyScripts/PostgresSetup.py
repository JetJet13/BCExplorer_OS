import psycopg2
from bitcoinrpc.authproxy import AuthServiceProxy
import simplejson as json

access = AuthServiceProxy("http://<user>:<pass>@127.0.0.1:2240")
postgres = psycopg2.connect(database="bcexchange", user="<username>",port=4567, password="<password>")

cursor = postgres.cursor()

def CreateTablesAndTriggers():

    cursor.execute("""CREATE TABLE address_bkc
    (
      id text,
      hash160 text,
      numtx bigint,
      total_sent numeric(15,4),
      total_received numeric(15,4),
      balance numeric(15,4),
      type text
    )
    """)


    cursor.execute("""CREATE TABLE address_bks
    (
      id text,
      hash160 text,
      numtx bigint,
      total_sent numeric(15,4),
      total_received numeric(15,4),
      balance numeric(15,4),
      type text
    )
    """)


    cursor.execute("""CREATE TABLE blocks
    (
      id text,
      height bigint,
      size bigint,
      ver smallint,
      timestamp bigint,
      bits text,
      difficulty numeric(12,8),
      nonce bigint,
      merkleroot text,
      prevhash text,
      type text,
      chain text,
      numtx bigint,
      proofhash text,
      modifier text,
      modifierchecksum text,
      coinagedestroyed bigint,
      mint numeric(12,4),
      vote jsonb,
      tx_received_bks bigint,
      solvedby text,
      tx_recieved_bkc bigint,
      numtx_bks bigint,
      numtx_bkc bigint,
      tx_received_bkc bigint,
      txs text[],
      motions text[],
      custodians text[]
    )
    """)

    cursor.execute("""CREATE TABLE chart_info
    (
      id text,
      data text[]
    )
    """)

    cursor.execute("""CREATE TABLE custodians
    (
      id text,
      amount bigint,
      numvotes integer,
      totalvotes integer,
      sdd bigint,
      passed boolean,
      passedblock bigint,
      latest_block bigint,
      url text,
      address text
    )
    """)

    cursor.execute("""CREATE TABLE hashtype
    (
      id text,
      type text,
      height bigint,
      "timestamp" bigint,
      chain text
    )
    """)

    cursor.execute("""CREATE TABLE input_txs
    (
      input_tx text,
      input_index integer,
      txhash text
    )
    """)

    cursor.execute("""CREATE TABLE motions
    (
      id text,
      numvotes integer,
      totalvotes integer,
      sdd bigint,
      passed boolean,
      passedblock bigint,
      latest_block bigint,
      url text
    )
    """)

    cursor.execute("""CREATE TABLE networkinfo
    (
      id text,
      height bigint,
      moneysupply numeric(15,4),
      connections integer,
      bks_usd numeric(10,4),
      bks_eur numeric(10,4),
      bks_cny numeric(10,4),
      bks_mcap_usd numeric(20,4),
      bks_mcap_eur numeric(20,4),
      bks_mcap_cny numeric(20,4),
      bkc_usd numeric(10,4),
      bkc_eur numeric(10,4),
      bkc_cny numeric(10,4),
      bkc_mcap_usd numeric(20,4),
      bkc_mcap_eur numeric(20,4),
      bkc_mcap_cny numeric(20,4),
      bkc_supply numeric(15,4)
    )
    """)

    cursor.execute("""CREATE TABLE orphan_blocks
    (
      id text,
      height bigint,
      size bigint,
      ver smallint,
      "timestamp" bigint,
      bits text,
      difficulty numeric(12,8),
      nonce bigint,
      merkleroot text,
      prevhash text,
      type text,
      chain text,
      numtx bigint,
      proofhash text,
      modifier text,
      modifierchecksum text,
      coinagedestroyed bigint,
      mint numeric(12,4),
      vote jsonb,
      tx_received_bks bigint,
      solvedby text,
      tx_recieved_bkc bigint,
      numtx_bks bigint,
      numtx_bkc bigint,
      tx_received_bkc bigint,
      txs text[],
      motions text[],
      custodians text[]
    )
    """)

    cursor.execute("""CREATE TABLE orphan_transactions
    (
      id text,
      ver smallint,
      "timestamp" bigint,
      in_count integer,
      inputs jsonb[],
      out_count integer,
      outputs jsonb[],
      type text,
      blockhash text,
      height bigint,
      chain text,
      addresses text[],
      in_total bigint,
      out_total bigint,
      tx_num bigint,
      out_txs text[],
      coinstake boolean,
      coinagedestroyed bigint
    )
    """)

    cursor.execute("""CREATE TABLE statuspage
    (
      id text,
      info jsonb
    )
    """)

    cursor.execute("""CREATE TABLE transactions
    (
      id text,
      ver smallint,
      "timestamp" bigint,
      in_count integer,
      inputs jsonb[],
      out_count integer,
      outputs jsonb[],
      type text,
      blockhash text,
      height bigint,
      chain text,
      addresses text[],
      in_total bigint,
      out_total bigint,
      tx_num bigint,
      out_txs text[],
      coinstake boolean,
      coinagedestroyed bigint
    )
    """)

    # ----------- TRIGGER FUNCTIONS ----------------

    cursor.execute("""CREATE OR REPLACE FUNCTION address_notify()
      RETURNS trigger AS
    $BODY$
    BEGIN
    PERFORM pg_notify('address_update', json_build_object('table', TG_TABLE_NAME, 'old_info', OLD, 'info', NEW, 'type', TG_OP)::text);
    RETURN NEW;
    END;
    $BODY$
    LANGUAGE plpgsql""")

    cursor.execute("""CREATE OR REPLACE FUNCTION blocks_notify()
      RETURNS trigger AS
    $BODY$
    BEGIN
    PERFORM pg_notify('block_insert', json_build_object('table', TG_TABLE_NAME, 'info', NEW, 'type', TG_OP)::text);
    RETURN NEW;
    END;
    $BODY$
    LANGUAGE plpgsql""")

    cursor.execute("""CREATE OR REPLACE FUNCTION new_txs_notify()
      RETURNS trigger AS
    $BODY$
    BEGIN
    IF TG_OP = 'INSERT' AND NEW.height = -1 THEN
    PERFORM pg_notify('unconfirmed_tx_insert', json_build_object('table', TG_TABLE_NAME, 'info', NEW, 'type', TG_OP)::text);
    END IF;
    RETURN NEW;
    END;
    $BODY$
    LANGUAGE plpgsql""")

    cursor.execute("""CREATE OR REPLACE FUNCTION table_update_notify()
      RETURNS trigger AS
    $BODY$BEGIN
    PERFORM pg_notify('table_update', json_build_object('table', TG_TABLE_NAME, 'info', NEW, 'type', TG_OP)::text);
    RETURN NEW;
    END;
    $BODY$
    LANGUAGE plpgsql""")

    # ---------- CREATE TRIGGERS --------------

    cursor.execute("""CREATE TRIGGER unconfirmed_tx_insert
      AFTER INSERT
      ON transactions
      FOR EACH ROW
      EXECUTE PROCEDURE new_txs_notify();""")

    cursor.execute("""CREATE TRIGGER networkinfo_notify_update
      AFTER UPDATE
      ON networkinfo
      FOR EACH ROW
      EXECUTE PROCEDURE table_update_notify();""")

    cursor.execute("""CREATE TRIGGER blocks_notify_insert
      AFTER INSERT
      ON blocks
      FOR EACH ROW
      EXECUTE PROCEDURE blocks_notify();""")
      
    cursor.execute("""CREATE TRIGGER address_update_bks
      AFTER UPDATE
      ON address_bks
      FOR EACH ROW
      EXECUTE PROCEDURE address_notify();
    """)
      
    cursor.execute("""CREATE TRIGGER address_update_bkc
      AFTER UPDATE
      ON address_bkc
      FOR EACH ROW
      EXECUTE PROCEDURE address_notify();""")

    postgres.commit()

def InsertIntoChartInfo():
    size_list = []
    diff_list = []
    block_list = []
    numtx_list = []
    cd_list = []
    mint_list = []
    cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('size_chart',size_list, ))
    cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('diff_chart',diff_list, ))
    cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('block_chart',block_list, ))
    cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('numtx_chart',numtx_list, ))
    cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('cd_chart',cd_list, ))
    cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('mint_chart',mint_list, ))
    postgres.commit()



CreateTablesAndTriggers()
InsertIntoChartInfo()

getInfo = access.getinfo()

networkInfo = {
                "height":getInfo["blocks"],
                "moneysupply":getInfo["moneysupply"],
                "connections":getInfo["connections"]
}
print networkInfo
# insert the network info into database
insert_network_info = """INSERT INTO networkinfo (id, height, moneysupply, connections) VALUES (%s, %s, %s, %s);"""
insert_network_data = ("network status", networkInfo["height"], networkInfo["moneysupply"], networkInfo["connections"], )
cursor.execute(insert_network_info,insert_network_data)

# insert the single status page row 
statuspage_cmd = """INSERT INTO statuspage (id, info) VALUES (%s,%s);"""
statuspage_data = ("status info", json.dumps(getInfo), )
cursor.execute(statuspage_cmd,statuspage_data)

postgres.commit()

cursor.close()
postgres.close()