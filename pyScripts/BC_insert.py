"""
AUTHOR: JOHNY GEORGES
DATE: 29/04/2014
HEXHASHREVERSER IS USED FOR PREV.BLOCK[v] HASH, MERKLE ROOT, BITS, RAW BLOCK[v] HASH ETC.
GETDIFFICULT WILL SPIT OUT THE DIFFICULTY OF THE BLOCK
"""

from __future__ import division
import time
import hashlib
from bitstring import BitArray
from bitcoinrpc.authproxy import AuthServiceProxy
import psycopg2
from psycopg2.extras import Json
import os
import simplejson as json
from settings import get_settings


conf = get_settings()

access = AuthServiceProxy("http://{}:{}@127.0.0.1:2240".format(
    conf['daemon_rpc']['username'],
    conf['daemon_rpc']['password']
))
postgres = psycopg2.connect(
    database=conf['database']['database_name'],
    user=conf['database']['username'],
    port=5432,
    password=conf['database']['password']
)

cursor = postgres.cursor()

d_cursor = postgres.cursor(
        cursor_factory=psycopg2.extras.RealDictCursor
)  # used for dictionary-like fetches.


def set2list (aSet):
    step1 = []
    for a in aSet:
        step1.append(a)
    return step1


def display_time(seconds):
    # print("minutes",seconds
    answer = []
    result = ""
    intervals = (('year', 525949), ('month', 43829), ('week', 10080), ('day', 1440), ('hour', 60), ('minute', 1))
    suffix = "s"
    for each in intervals:
        interval_sec = each[1]
        modo = seconds//interval_sec
        rojo = seconds//interval_sec
        if modo != 0:
            if modo > 1:
                # mojo = str(modo)+" "+each[0]+suffix
                # print(mojo
                answer.append({"duration": modo, "type": each[0] + suffix})
                seconds -= interval_sec*rojo
                print("minutes minus", seconds)
            else:
                # jojo = str(modo)+" "+each[0]
                # print(jojo
                answer.append({"duration": modo, "type": each[0]})
                seconds -= each[1]
                # print("minutes minus 1",seconds
    r = 0
    for each in answer:
        dur = each["duration"]
        typ = each["type"]
        if dur == 4 and typ == "weeks":
            answer[r-1]["duration"] += 1
            del answer[r]
            r -= 1
        elif dur == 7 and typ == "days":
            answer[r-1]["duration"] += 1
            del answer[r]
            r -= 1
        elif dur == 24 and typ == "hours":
            answer[r-1]["duration"] += 1
            del answer[r]
            r -= 1
        elif dur == 60 and typ == "minutes":
            answer[r-1]["duration"] += 1
            del answer[r]
            r -= 1
        r += 1
    q = 0
    for each in answer:
        dur = each["duration"]
        typ = each["type"]
        if dur == 12 and typ == "months":
            answer[q]["type"] = "year"
            answer[q]["duration"] = 1
        if dur == 4 and typ == "weeks":
            answer[q]["type"] = "month"
            answer[q]["duration"] = 1
        elif dur == 7 and typ == "days":
            answer[q]["type"] = "week"
            answer[q]["duration"] = 1
        elif dur == 24 and typ == "hours":
            answer[q]["type"] = "day"
            answer[q]["duration"] = 1
        elif dur == 60 and typ == "minutes":
            answer[q]["type"] = "hour"
            answer[q]["duration"] = 1
        q += 1
    if len(answer) > 1:
        for x in range(0, 2):
            result += str(answer[x]["duration"])+" "+answer[x]["type"]+" "
    else:
        result += str(answer[0]["duration"])+" "+answer[0]["type"]+" "
    return result


def hexHashReverser(bit):
    step1 = BitArray(bit)
    step2 = step1.hex
    step3 = step2[::-1]
    step4 = len(step2)
    string = ''
    for b in range(0, step4, 2):
        revString = step3[b:(b+2)]
        string += revString[::-1]

    return string


def getBigEndian(hex_val):
    if not hex_val:
        print('BigEndian - no hex_val passed')
        return 0L
    step0 = "0x" + hex_val
    step1 = BitArray(step0)
    step2 = step1.hex
    step3 = step2[::-1]
    step4 = len(step2)
    string = ""
    for b in range(0, step4, 2):
        revString = step3[b:(b+2)]
        string += revString[::-1]

    return string


def getLitEndian(hex_val):
    if not hex_val:
        return 0L
    step0 = "0x" + hex_val
    step1 = BitArray(step0)
    step2 = step1.uintle
    return step2


def getDifficult(bits):
    step0 = getBigEndian(bits)
    step1 = "0x"+step0
    step2 = BitArray(step1)
    step3 = step2.hex
    first_pair = "0x" + step3[:2]
    firstPair = BitArray(first_pair)
    second_pair = "0x" + step3[2:8]
    secondPair = BitArray(second_pair)
    firstPairVal = firstPair.int
    secondPairVal = secondPair.int
    formula = 2**(8*(firstPairVal - 3))
    bitsDec = secondPairVal * formula
    highestDifficulty = BitArray("0x00000000FFFF0000000000000000000000000000000000000000000000000000")
    highDiffDec = highestDifficulty.int
    answer = float(highDiffDec/bitsDec)
    return answer


def computeBlockHash(rawHash):
    initial_step = "0x" + rawHash
    primary_step = BitArray(initial_step)
    step0 = primary_step.bytes
    step1 = hashlib.sha256(step0)
    step2 = step1.digest()
    step3 = hashlib.sha256(step2)
    step4 = step3.hexdigest()
    step5 = "0x" + step4
    step6 = BitArray(step5)
    step7 = hexHashReverser(step6)
    return step7


def computeTransHash(rawHash):
    if not rawHash:
        return ''
    initial_step = "0x" + rawHash
    primary_step = BitArray(initial_step)
    step0 = primary_step.bytes
    step1 = hashlib.sha256(step0)
    step2 = step1.digest()
    step3 = hashlib.sha256(step2)
    step4 = step3.hexdigest()
    step5 = "0x" + step4
    step6 = BitArray(step5)
    step7 = hexHashReverser(step6)
    return step7
# address must be in decimal form before entering it into base58encode


def base58encode(dec_address):
    b58chars = '123543289ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    b58base = len(b58chars)
    answer = ""
    while dec_address >= 1:
        modulo = dec_address % b58base
        answer = b58chars[modulo] + answer
        dec_address = int((dec_address - modulo) // b58base)

    return answer
__b58chars = '123543289ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
__b58base = len(__b58chars)
b58chars = __b58chars


def b58decode(v, length=None):
    """ decode v into a string of len bytes
    """
    long_value = 0
    for (i, c) in enumerate(v[::-1]):
        long_value += __b58chars.find(c) * (__b58base**i)

    result = bytes()
    while long_value >= 256:
        div, mod = divmod(long_value, 256)
        result = chr(mod) + result
        long_value = div
    result = chr(long_value) + result

    nPad = 0
    for c in v:
        if c == __b58chars[0]:
            nPad += 1
        else:
            break

    result = chr(0)*nPad + result
    if length is not None and len(result) != length:
        return None

    return result


def getAddress(hex_string, tx_type):
    step0 = "0x" + hex_string
    step1 = BitArray(step0)
    step2 = step1.bytes
    step3 = hashlib.sha256(step2)
    step4 = step3.digest()
    step5 = hashlib.new("ripemd160", step4)
    step6 = step5.hexdigest()
    if tx_type == '38':
        step7 = "12" + step6
    else:
        step7 = "1C" + step6
    step8 = "0x" + step7
    step9 = BitArray(step8)
    step10 = hashlib.sha256(step9.bytes)
    step11 = step10.digest()
    step12 = hashlib.sha256(step11)
    step13 = step12.hexdigest()
    check_sum = step13[0:8]
    step14 = step7 + check_sum
    step15 = "0x"+step14
    step16 = BitArray(step15)
    step17 = step16.int
    step18 = base58encode(step17)

    return step18


def getAddress20byte(hex_string, tx_type):

    if tx_type == "38":

        step0 = "0x12" + hex_string  # BlockShares
    else:

        step0 = "0x1C" + hex_string  # BlockCredits

    step1 = BitArray(step0)

    step10 = hashlib.sha256(step1.bytes)
    step11 = step10.digest()

    step12 = hashlib.sha256(step11)
    step13 = step12.hexdigest()

    check_sum = step13[0:8]

    step14 = step0 + check_sum

    step15 = BitArray(step14)

    step17 = step15.int

    step18 = base58encode(step17)

    return step18


def getAddress20byteP2SH(hex_string, tx_type):  # this is for pay-to-script-hash 20byte

    if tx_type == "38":

        step0 = "0x14" + hex_string  # BlockShares

    else:

        step0 = "0x1E" + hex_string  # BlockCredits

    step1 = BitArray(step0)

    step10 = hashlib.sha256(step1.bytes)
    step11 = step10.digest()

    step12 = hashlib.sha256(step11)
    step13 = step12.hexdigest()

    check_sum = step13[0:8]

    step14 = step0 + check_sum

    step15 = BitArray(step14)

    step17 = step15.int

    step18 = base58encode(step17)

    return step18


def getHash160(hex_string):
    step0 = "0x" + hex_string
    step1 = BitArray(step0)

    step2 = step1.bytes
    step3 = hashlib.sha256(step2)
    step4 = step3.digest()

    step5 = hashlib.new("ripemd160", step4)
    step6 = step5.hexdigest()

    return step6


def removeDups(seq):
    seen = set()
    seen_add = seen.add
    return [x for x in seq if x not in seen and not seen_add(x)]


def byte_from_file(filename):
    with open(filename, "rb") as byte_file:
        while True:
            byte = byte_file.read(1)
            if byte:
                yield byte
            else:
                break


def parse_block(each, x):
    # compute the blockhash to get info from rpc
    bHash = computeBlockHash(each[8:168])
    cursor.execute("SELECT height FROM blocks WHERE id = %s", (bHash,))
    if cursor.rowcount > 0:
        print("block {} at height {} already found".format(bHash, cursor.fetchone()[0]))
        return
    bInfo = access.getblock(bHash)
    # Lets collect the block details
    bHeight = bInfo["height"]
    bSize = bInfo["size"]
    bVer = bInfo["version"]
    bMrkRoot = bInfo["merkleroot"]
    bBits = bInfo["bits"]
    bDifficulty = bInfo["difficulty"]
    bNonce = bInfo["nonce"]
    bType = bInfo["flags"]
    bProofHash = bInfo["proofhash"]
    bModifier = bInfo["modifier"]
    bModifierCheckSum = bInfo["modifierchecksum"]
    bCoinageDestroyed = bInfo["coinagedestroyed"]
    bMint = bInfo["mint"]
    bNumTx = len(bInfo["tx"])
    bVote = bInfo["vote"]
    bMotions = bInfo["vote"]["motions"]
    bCusto = []
    bTxs = bInfo["tx"]
    bTimeStamp = getLitEndian(each[144:152])  # timestamp in unix time
    print(bHeight, bCoinageDestroyed)
    # let's get custodians into a list
    for c in range(0, len(bInfo["vote"]["custodians"])):
        custo = bInfo["vote"]["custodians"][c]["address"]
        amount = int(bInfo["vote"]["custodians"][c]["amount"] * 10000)
        bCusto.append(custo + "_" + str(amount))

    # some conditions to consider
    if bHeight == 0:
        bPrevHash = ""
    else:
        bPrevHash = bInfo["previousblockhash"]

    if "nextblockhash" in bInfo:
        bNextHash = bInfo["nextblockhash"]
    else:
        bNextHash = ""

    if bType == "proof-of-stake stake-modifier":
        bType = "proof-of-stake"
    elif bType == "proof-of-work stake-modifier":
        bType = "proof-of-work"

    # let's check which chain the block is on
    bCheck = access.getblockhash(bHeight)
    if bCheck == bHash:
        # this is a main chain block
        bChain = "main"
    else:
        # this is an orphaned block
        bChain = "orphan"

    # Organize bInfo into a dictionary
    block = {
        "id": bHash,
        "height": bHeight,
        "size": bSize,
        "ver": bVer,
        "timestamp": bTimeStamp,
        "bits": bBits,
        "difficulty": bDifficulty,
        "nonce": bNonce,
        "merkleroot": bMrkRoot,
        "prevhash": bPrevHash,
        "nexthash": bNextHash,
        "type": bType,
        "chain": bChain,
        "numTx": bNumTx,
        "numTx_bks": 0,
        "numTx_bkc": 0,
        "proofhash": bProofHash,
        "modifier": bModifier,
        "modifierchecksum": bModifierCheckSum,
        "coinagedestroyed": bCoinageDestroyed,
        "mint": bMint,
        "vote": bVote,
        "tx_received_bks": 0,
        "tx_received_bkc": 0,
        "txs": bTxs,
        "motions": bMotions,
        "custodians": bCusto
    }

    tx_index = 0
    for tx in block['txs']:
        parse_transaction(tx, tx_index, block)
        tx_index += 1

    # save the block
    chain = block["chain"]
    bHash = block["id"]
    if chain == 'main':
        cursor.execute(
            "SELECT height FROM blocks where id = %s;",
            (bHash,)
        )
        if cursor.rowcount == 0:
            insert_block = (
                "INSERT INTO blocks (id, height, size, ver, timestamp, bits, difficulty, "
                "nonce, merkleroot, prevhash, nexthash, type, chain, numtx, proofhash, modifier, "
                "modifierchecksum, mint, vote, tx_received_bks, solvedby, "
                "tx_received_bkc, numtx_bks, numtx_bkc, coinagedestroyed, txs, motions, "
                "custodians) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                "%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
            )
            insert_data = (
                block["id"], block["height"], block["size"], block["ver"],
                block["timestamp"], block["bits"], block["difficulty"], block["nonce"],
                block["merkleroot"], block["prevhash"], block["nexthash"], block["type"],
                block["chain"], block["numTx"], block["proofhash"], block["modifier"],
                block["modifierchecksum"], block["mint"], json.dumps(block["vote"]),
                block["tx_received_bks"], block["solvedby"], block["tx_received_bkc"],
                block["numTx_bks"], block["numTx_bkc"], block["coinagedestroyed"],
                block["txs"], block["motions"], block["custodians"]
            )
            print("inserting %s on chain: %s" % (x, chain))
            try:
                cursor.execute(insert_block, insert_data)
            except psycopg2.DataError as e:
                print('error saving block'.format(e))
            postgres.commit()
    elif chain == "orphan":
        cursor.execute(
            "SELECT height FROM orphan_blocks where id = %s;",
            (bHash,)
        )
        if cursor.rowcount == 0:
            insert_block = (
                "INSERT INTO orphan_blocks (id, height, size, ver, timestamp, bits, "
                "difficulty, nonce, merkleroot, prevhash, nexthash, type, chain, numtx, "
                "proofhash, modifier, modifierchecksum, mint, vote, tx_received_bks, "
                "solvedby, tx_received_bkc, numtx_bks, numtx_bkc, coinagedestroyed, txs, "
                "motions, custodians) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                "%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
            )
            insert_data = (
                block["id"], block["height"], block["size"], block["ver"],
                block["timestamp"], block["bits"], block["difficulty"], block["nonce"],
                block["merkleroot"], block["prevhash"], block['nexthash'], block["type"],
                block["chain"], block["numTx"], block["proofhash"], block["modifier"],
                block["modifierchecksum"], block["mint"], json.dumps(block["vote"]),
                block["tx_received_bks"], block["solvedby"], block["tx_received_bkc"],
                block["numTx_bks"], block["numTx_bkc"], block["coinagedestroyed"],
                block["txs"], block["motions"], block["custodians"]
            )
            print("inserting %s on chain: %s" % (x, chain))
            cursor.execute(insert_block, insert_data)
            postgres.commit()

    # hashtype table insert block
    insert_hash = (
        "INSERT INTO hashtype (id, type, height, timestamp, chain) "
        "VALUES (%s, %s, %s, %s, %s);"
    )
    insert_hash_data = (
        block["id"], "block", block["height"], block["timestamp"], block["chain"]
    )
    cursor.execute(insert_hash, insert_hash_data)
    postgres.commit()


def parse_transaction(tx, tx_index, block):
    trans = {}
    raw_tx = access.getrawtransaction(tx, 1)
    trans["ver"] = raw_tx.get('version')
    trans['timestamp'] = raw_tx.get('timestamp')
    trans["chain"] = block['chain']
    trans["coinstake"] = False
    trans["coinagedestroyed"] = 0
    trans["in_count"] = len(raw_tx.get('vin', []))
    trans["inputs"] = []
    trans["in_total"] = 0
    trans["JSONinputs"] = []
    vin_n = 0
    for tx_input in raw_tx.get('vin', []):
        input_details = {
            "in_num": vin_n,
            "in_tx": tx_input.get('txid', ''),
            "in_index": tx_input.get('sequence', ''),
            "in_script": tx_input.get('scriptSig', {'hex': ''}).get('hex'),
            "address": "",
            "in_val": 0
        }
        if tx_input.get('coinbase'):
            tx_input["address"] = "Coinbase"
        vin_n += 1
        trans["inputs"].append(input_details)
        trans["JSONinputs"].append(json.dumps(input_details))

    trans["out_count"] = len(raw_tx.get('vout', []))
    trans["outputs"] = []
    trans["out_total"] = 0
    trans["JSONoutputs"] = []
    trans["out_txs"] = []
    for tx_output in raw_tx.get('vout', []):
        trans["out_txs"].append('unspent')
        tx_n = tx_output.get('n', -1)
        script_pub_key = tx_output.get('scriptPubKey')
        output_details = {
            "out_num": tx_n,
            "out_val": tx_output.get('value', 0),
            "address": script_pub_key.get('addresses', [''])[0],
            "hash160": '',
            "script": {
                "raw": script_pub_key.get('hex', ''),
                "decode": script_pub_key.get('asm', '')
            },
            "type": script_pub_key.get('type', '')
        }
        trans["out_total"] += tx_output.get('value', 0)
        trans["outputs"].append(output_details)

        # block solved by no one in genesis block
        if tx_index == 0 and tx_n == 0 and block["height"] == 0:
            block["solvedby"] = "No-one"
        # block solved by 2nd output in 2nd transaction of block
        elif tx_index == 1 and tx_n == 1 and block["type"] == "proof-of-stake":
            block["solvedby"] = script_pub_key.get('addresses', [''])[0]
            trans["coinstake"] = True
            trans["coinagedestroyed"] = block["coinagedestroyed"]
        # block solved by 1st output in 1st transaction of block
        elif tx_index == 0 and tx_n == 0 and block["type"] == "proof-of-work":
            block["solvedby"] = script_pub_key.get('addresses', [''])[0]

    trans["id"] = raw_tx.get('txid')
    trans["type"] = raw_tx.get('unit')
    trans["blockhash"] = raw_tx.get('blockhash')
    trans["blockheight"] = block['height']
    trans["tx_num"] = tx_index
    trans["addresses"] = set()

    # block information
    if trans["type"] == "8":
        block["numTx_bks"] += 1
        block["tx_received_bks"] += trans["out_total"]
    else:
        block["numTx_bkc"] += 1
        block["tx_received_bkc"] += trans["out_total"]

    # save the transaction
    tx_hash = trans["id"]
    cursor.execute("SELECT height FROM transactions WHERE id = %s;", (tx_hash,))
    if cursor.rowcount == 0:
        tx_type = trans["type"]
        tx_inCount = trans["in_count"]
        tx_outCount = trans["out_count"]
        tx_chain = trans["chain"]
        if tx_type == "8":
            address_type = "BKS"
        else:
            address_type = "BKC"

        for tx_output in trans["outputs"]:
            trans["addresses"].add(tx_output["address"])
            trans["JSONoutputs"].append(json.dumps(tx_output))
            if (
                tx_output["address"] != "None" and
                tx_output["address"] != "NonStandard" and
                tx_chain == 'main'
            ):
                if address_type == "BKS":
                    cursor.execute(
                        "SELECT id FROM address_bks WHERE id = %s LIMIT 1;",
                        (tx_output['address'],)
                    )
                else:  # BKC
                    cursor.execute(
                        "SELECT id FROM address_bkc WHERE id = %s LIMIT 1;",
                        (tx_output['address'],)
                    )
                if cursor.rowcount == 0:
                    if address_type == "BKS":
                        insert_address = (
                            "INSERT INTO address_bks (id, hash160, numtx, total_sent, "
                            "total_received, balance, type) "
                            "VALUES (%s,%s,%s,%s,%s,%s,%s);"
                        )
                    else:  # BKC
                        insert_address = (
                            "INSERT INTO address_bkc (id, hash160, numtx, total_sent, "
                            "total_received, balance, type) "
                            "VALUES (%s,%s,%s,%s,%s,%s,%s);"
                        )
                    insert_address_data = (
                        tx_output["address"], tx_output["hash160"], 0, 0,
                        tx_output["out_val"], tx_output["out_val"], address_type
                    )
                    cursor.execute(insert_address, insert_address_data)
                    postgres.commit()
                else:
                    if address_type == "BKS":
                        update_address_out = (
                            "UPDATE address_bks SET total_received = total_received + %s,"
                            " balance = balance + %s WHERE id = %s;"
                        )
                    else:  # BKC
                        update_address_out = (
                            "UPDATE address_bkc SET total_received = total_received + %s,"
                            " balance = balance + %s WHERE id = %s;"
                        )
                    update_address_out_data = (
                        tx_output["out_val"], tx_output["out_val"], tx_output["address"]
                    )
                    cursor.execute(update_address_out, update_address_out_data)
                    postgres.commit()

        insert_input_tx = (
            "INSERT INTO input_txs (input_tx, input_index, txhash) VALUES (%s, %s, %s);"
        )
        for tx_input in trans['inputs']:
            insert_input_data = (tx_input["in_tx"], tx_input["in_index"], tx_hash,)
            try:
                cursor.execute(insert_input_tx, insert_input_data)
            except psycopg2.DataError as e:
                print('error saving transaction input: {}'.format(e))
            postgres.commit()
            # now let's find input addresses and amounts
            input_tx = tx_input["in_tx"]
            input_index = tx_input["in_index"]
            # print(input_tx,input_index
            d_cursor.execute(
                "SELECT * FROM transactions WHERE id = %s;",
                (input_tx,))
            fetch = d_cursor.fetchone()
            if fetch is None:
                d_cursor.execute(
                    "SELECT * FROM orphan_transactions WHERE id = %s;",
                    (input_tx,))
                fetch = d_cursor.fetchone()

            if fetch:
                input_address = fetch["outputs"][input_index]["address"]
                input_value = fetch["outputs"][input_index]["out_val"]
                tx_input["address"] = input_address
                tx_input["in_val"] = input_value
                trans["in_total"] += input_value
                trans["addresses"].add(input_address)

            # now let's update the fetched transaction for out_txs
            if tx_chain == 'main':
                try:
                    cursor.execute(
                        "UPDATE transactions SET out_txs[%s] = %s WHERE id = %s;",
                        (input_index + 1, tx_hash, input_tx,)
                    )
                except psycopg2.DataError as e:
                    print('error updating transaction: {}'.format(e))
                postgres.commit()
            elif tx_chain == 'orphan':
                cursor.execute(
                    "UPDATE orphan_transactions SET out_txs[%s] = %s WHERE id = %s;",
                    (input_index + 1, tx_hash, input_tx,))
                postgres.commit()

            if tx_input["address"] != "Coinbase" and tx_chain == 'main':
                if address_type == "BKS":
                    update_address_in = (
                        "UPDATE address_bks SET total_sent = total_sent + %s, "
                        "balance = balance - %s WHERE id = %s;"
                    )
                else:  # BKC
                    update_address_in = (
                        "UPDATE address_bkc SET total_sent = total_sent + %s,"
                        "balance = balance - %s WHERE id = %s;"
                    )
                update_address_in_data = (
                    tx_input["in_val"],
                    tx_input["in_val"],
                    tx_input["address"]
                )
                cursor.execute(update_address_in, update_address_in_data)
                postgres.commit()

        if tx_chain == 'main':
            insert_tx = (
                "INSERT INTO transactions (id, ver, timestamp, in_count, inputs, "
                "out_count, tx_num, outputs, type, blockhash, height, chain, addresses, "
                "in_total,out_total, out_txs, coinstake, coinagedestroyed) "
                "VALUES (%s,%s,%s,%s,%s::jsonb[],%s,%s,%s::jsonb[],%s,%s,%s,%s,%s,"
                "%s,%s,%s,%s,%s);"
            )
            insert_tx_data = (
                tx_hash, trans["ver"], trans["timestamp"], tx_inCount,
                trans["JSONinputs"], tx_outCount, trans["tx_num"], trans["JSONoutputs"],
                tx_type, trans["blockhash"], trans["blockheight"], trans["chain"],
                set2list(trans["addresses"]), trans["in_total"], int(trans["out_total"]),
                trans["out_txs"], trans["coinstake"], trans["coinagedestroyed"]
            )
            try:
                cursor.execute(insert_tx, insert_tx_data)
            except psycopg2.DataError as e:
                print('error saving transaction: {}'.format(e))
            postgres.commit()
            print("MAIN - just inserted tx,", tx_hash)
        else:
            cursor.execute(
                "SELECT height FROM orphan_transactions WHERE id = %s;",
                (tx_hash,)
            )
            if cursor.rowcount == 0:
                insert_tx = (
                    "INSERT INTO orphan_transactions (id, ver, timestamp, in_count, "
                    "inputs, out_count, tx_num, outputs, type, blockhash, height, chain, "
                    "addresses, in_total, out_total, out_txs, coinstake, "
                    "coinagedestroyed) VALUES (%s,%s,%s,%s,%s::jsonb[],%s,%s,%s::jsonb[],"
                    "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"
                )

                insert_tx_data = (
                    tx_hash, trans["ver"], trans["timestamp"], tx_inCount,
                    trans["JSONinputs"], tx_outCount, trans["tx_num"],
                    trans["JSONoutputs"], tx_type, trans["blockhash"],
                    trans["blockheight"], trans["chain"], set2list(trans["addresses"]),
                    trans["in_total"], trans["out_total"], trans["out_txs"],
                    trans["coinstake"], trans["coinagedestroyed"]
                )
                cursor.execute(insert_tx, insert_tx_data)
                postgres.commit()
                print("ORPHAN just inserted,", tx_hash)
        if tx_chain == 'main':
            for address in trans["addresses"]:
                if address_type == "BKS":
                    update_numtx = (
                        "UPDATE address_bks SET numtx = numtx + 1 WHERE id = %s;"
                    )
                else:  # BKC
                    update_numtx = (
                        "UPDATE address_bkc SET numtx = numtx + 1 WHERE id = %s;"
                    )
                update_numtx_data = (address,)
                cursor.execute(update_numtx, update_numtx_data)
                postgres.commit()

        # hashtype table insert transaction
        insert_hash = (
            "INSERT INTO hashtype (id, type, height, timestamp, chain) "
            "VALUES (%s, %s, %s, %s, %s);"
        )
        insert_hash_data = (
            tx_hash, "tx_" + tx_type, trans["blockheight"], trans["timestamp"],
            trans["chain"]
        )
        cursor.execute(insert_hash, insert_hash_data)
        postgres.commit()


def main():
    start_time = time.time()
    print("Current block count: ", access.getblockcount())

    # Linux Users
    blk01 = "/home/bcex/.bcexchange/blk0001.dat"
    blk02 = "/home/bcex/.bcexchange/blk0002.dat"
    blk = ""

    start_height = 0
    
    #  Windows Users
    # blk01 = "C:/users/home/appdata/roaming/bcexchange/blk0001.dat"
    # blk02 = "C:/users/home/appdata/roaming/bcexchange/blk0002.dat"
    # blk = ""
    if os.path.isfile(blk02):
        blk = blk02
        print("blk02 found")
    else:
        blk = blk01

    raw_block = b''
    height = 0

    for byte in byte_from_file(os.path.expanduser(blk)):
        raw_block += byte
        block_buffer = raw_block[-4:]
        if block_buffer == 'bcde4b9e'.decode('hex'):
            if raw_block == block_buffer:
                continue
            if height > start_height:
                parse_block(raw_block.encode('hex').replace('bcde4b9e', ''), height)
            else:
                print(height)
            height += 1
            raw_block = ''
    
    # vote_tracker is for the motions and custodians xrange values
    # the vote_tracker_start holds the value before the blocks insert into table
    cursor.execute("SELECT COUNT(*) FROM blocks;")
    vote_tracker_start = cursor.fetchone()[0]


    
    elapsed_time = time.time() - start_time
    print("%s seconds for complete blockchain Parse" % elapsed_time)
    
    getInfo = access.getinfo()
    
    networkInfo = {
                    "height":getInfo["blocks"],
                    "moneysupply":getInfo["moneysupply"],
                    "connections":getInfo["connections"]
    }
    print(networkInfo)
    
    # insert the network info into database
    # insert_network_info = "INSERT INTO networkinfo (id, height, moneysupply, connections) VALUES (%s, %s, %s, %s);"
    # insert_network_data = ("network status", networkInfo["height"], networkInfo["moneysupply"], networkInfo["connections"], )
    # cursor.execute(insert_network_info,insert_network_data)
    # postgres.commit()
    
    # update the status page info
    update_status_info = "UPDATE statuspage SET info = %s WHERE id = 'status info';"
    update_status_data = (json.dumps(getInfo), )
    cursor.execute(update_status_info,update_status_data)
    postgres.commit()
    
    # update the networking info
    update_network_info = "UPDATE networkinfo SET height = %s, moneysupply = %s, connections = %s WHERE id = 'network status';"
    update_network_data = (networkInfo["height"], networkInfo["moneysupply"], networkInfo["connections"], )
    cursor.execute(update_network_info,update_network_data)
    postgres.commit()
    
    # vote_tracker is for the motions and custodians xrange values
    # the vote_tracker_start holds the value after the blocks insert into table
    cursor.execute("SELECT count(*) FROM blocks;")
    vote_tracker_end = cursor.fetchone()[0]
    
    vote_start = vote_tracker_start
    vote_end = vote_tracker_end
    print("vote_start",vote_start,"vote-end",vote_end)
    # custodians
    for x in xrange(vote_start,vote_end):
        print(vote_end - x,"Custodian more to go")
        getCustodians = access.getcustodianvotes(x)
        for m in getCustodians:
            address = m
            if m != "total":
                for a in getCustodians[m]:
                    amount = int(float(a)*10000)
                    id = address + "_" + str(amount)
                    numvotes = getCustodians[m][a]["blocks"]
                    sdd = getCustodians[m][a]["sharedays"]
                    sdd_percent = getCustodians[m][a]["shareday_percentage"]
                    latest_block = x
    
                    if numvotes > 5000 and sdd_percent > 0.5: # the custodian has passed
                        passed = True
                        passedblock = x
                        d_cursor.execute("SELECT passed FROM custodians WHERE id = %s;", (id, ))
                        if d_cursor.fetchone()["passed"] == False:
                            cursor.execute("UPDATE custodians SET passed = %s, passedblock = %s, \
                                                               latest_block = %s, numvotes = %s, sdd = %s \
                                                               WHERE id = %s;",
                                            (passed, passedblock, latest_block, numvotes, sdd, id, ))
                            postgres.commit()
                    else: # the custodian has NOT passed
                        # let's check if the custodian is already in the table
                        d_cursor.execute("SELECT id FROM custodians WHERE id = %s;", (id, ))
                        if d_cursor.rowcount == 0: # the motion is NEW
                            cursor.execute("INSERT INTO custodians (id, amount, numvotes, totalvotes, sdd, passed, passedblock, latest_block, url, address)\
                                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s,%s);",
                                            (id, amount, numvotes, numvotes, sdd, False, 0, latest_block, '?', address ))
                            postgres.commit()
                        else:
                            # let's check if the latest_block is ahead of previous latest_block
                            d_cursor.execute("SELECT latest_block,numvotes,passed FROM custodians WHERE id = %s;", (id, ))
                            get_prev_info = d_cursor.fetchone()
                            if latest_block > get_prev_info["latest_block"] and numvotes != get_prev_info["numvotes"] and get_prev_info["passed"] == False:
                                print("updating!")
                                if numvotes > get_prev_info["numvotes"]:
                                    cursor.execute("UPDATE custodians SET latest_block = %s, numvotes = %s, sdd = %s \
                                                                       WHERE id = %s;",
                                                    (latest_block, numvotes, sdd, id, ))
                                    postgres.commit()
                                elif numvotes < get_prev_info["numvotes"]:
                                    cursor.execute("UPDATE custodians SET numvotes = %s, sdd = %s \
                                                                       WHERE id = %s;",
                                                    (numvotes, sdd, id, ))
                                    postgres.commit()
                                
                
    
        
    
    
    # LET'S UPDATE THE totalvotes FOR EACH CUSTODIAN
    get_total_votes = access.getcustodianvotes(vote_end-1,vote_end-1)
    for t in get_total_votes:
        address = t
        if t != "total":
            for a in get_total_votes[t]:
                amount = int(float(a)*10000)
                id = address + "_" + str(amount)
                total_votes = get_total_votes[t][a]["blocks"]
                d_cursor.execute("SELECT totalvotes FROM custodians WHERE id = %s;", (id, ))
                get_prev_info = d_cursor.fetchone()
                if total_votes > get_prev_info["totalvotes"]:
                    cursor.execute("UPDATE custodians SET totalvotes = %s WHERE id = %s;", (total_votes,id, ))
                    postgres.commit()
    
    # motions
    for x in xrange(vote_start,vote_end):
        print(vote_end - x,"Motion more to go")
        getMotions = access.getmotions(x)
        for m in getMotions:
            id = m
            numvotes = getMotions[m]["blocks"]
            sdd = getMotions[m]["sharedays"]
            sdd_percent = getMotions[m]["shareday_percentage"]
            latest_block = x
    
            if numvotes > 5000 and sdd_percent > 0.5: # the motion has passed
                passed = True
                passedblock = x
                d_cursor.execute("SELECT passed FROM motions WHERE id = %s;", (id, ))
                if d_cursor.fetchone()["passed"] == False:
                    cursor.execute("UPDATE motions SET passed = %s, passedblock = %s, \
                                                       latest_block = %s, numvotes = %s, sdd = %s \
                                                       WHERE id = %s;",
                                    (passed, passedblock, latest_block, numvotes, sdd, id, ))
                    postgres.commit()
            else: # the motion has NOT passed
                # let's check if the motion is already in the table
                d_cursor.execute("SELECT id FROM motions WHERE id = %s;", (id, ))
                if d_cursor.rowcount == 0: # the motion is NEW
                    cursor.execute("INSERT INTO motions (id, numvotes, totalvotes, sdd, passed, passedblock, latest_block, url)\
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);",
                                    (id, numvotes, numvotes, sdd, False, 0, latest_block, '?', ))
                    postgres.commit()
                else:
                    # let's check if the latest_block is ahead of previous latest_block
                    d_cursor.execute("SELECT latest_block,numvotes,passed FROM motions WHERE id = %s;", (id, ))
                    get_prev_info = d_cursor.fetchone()
                    print(latest_block,">",get_prev_info["latest_block"])
                    print(numvotes,">",get_prev_info["numvotes"])
                    if latest_block > get_prev_info["latest_block"] and numvotes != get_prev_info["numvotes"] and get_prev_info["passed"] == False:
                        print("updating!")
                        if numvotes > get_prev_info["numvotes"]:
                            cursor.execute("UPDATE motions SET latest_block = %s, numvotes = %s, sdd = %s \
                                                           WHERE id = %s;",
                                        (latest_block, numvotes, sdd, id, ))
                            postgres.commit()
    
                        elif numvotes < get_prev_info["numvotes"]:
                            cursor.execute("UPDATE motions SET numvotes = %s, sdd = %s \
                                                           WHERE id = %s;",
                                        (numvotes, sdd, id, ))
                            postgres.commit()
                           
    
    
    # LET'S UPDATE THE totalvotes FOR EACH MOTION
    get_total_votes = access.getmotions(vote_end-1,vote_end-1)
    for t in get_total_votes:
        total_votes = get_total_votes[t]["blocks"]
        id = t
        d_cursor.execute("SELECT totalvotes FROM motions WHERE id = %s;", (t, ))
        get_prev_info = d_cursor.fetchone()
        if total_votes > get_prev_info["totalvotes"]:
            print("updating totalvotes!")
            cursor.execute("UPDATE motions SET totalvotes = %s WHERE id = %s;", (total_votes,t, ))
            postgres.commit()
    
    print("Done")
    
    
if __name__ == '__main__':
    main()

