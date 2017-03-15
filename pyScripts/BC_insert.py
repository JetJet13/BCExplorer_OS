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
import logging
from settings import get_settings


logger = logging.getLogger('insert')

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
    # logger.info("minutes",seconds
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
                # logger.info(mojo
                answer.append({"duration": modo, "type": each[0] + suffix})
                seconds -= interval_sec*rojo
                logger.info("minutes minus", seconds)
            else:
                # jojo = str(modo)+" "+each[0]
                # logger.info(jojo
                answer.append({"duration": modo, "type": each[0]})
                seconds -= each[1]
                # logger.info("minutes minus 1",seconds
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
    logger.info(bHeight, bCoinageDestroyed)
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
    # we need a counter/pointer as we decode the transactions, bit by bit
    if bNumTx > 255:
        counter = 174
    else:
        counter = 170

    # time to decode the transactions in the respected block
    tx = each
    for r in range(0, bNumTx):
        # let's find the transaction type
        trans = {}
        h = counter
        tx_ver = getLitEndian(tx[counter:counter + 8])
        tx_timestamp = getLitEndian(tx[counter + 8: counter + 16])
        trans["ver"] = tx_ver
        trans["timestamp"] = tx_timestamp
        trans["chain"] = bChain
        trans["coinstake"] = False
        trans["coinagedestroyed"] = 0
        # logger.info("ver,timestamp", tx_ver, tx_timestamp
        counter += 16
        # ---------------------------INPUT PARSING----------------------------------------
        # let's find input count
        tx_inCount = tx[counter:counter + 2]
        if tx_inCount != "fd":  # < 255 inputs
            inCount = int(tx_inCount, 16)
            counter += 2
        elif tx_inCount == "fd" and len(access.getrawtransaction(bInfo["tx"][r], 1)[
                                            "vin"]) >= 255:  # > 255 inputs
            inCount = getLitEndian(tx[counter + 2:counter + 6])
            counter += 6
        else:  # the actual hex byte === fd --> exactly 253 inputs
            inCount = int(tx_inCount, 16)
            counter += 2
        trans["in_count"] = inCount
        trans["inputs"] = []
        trans["in_total"] = 0
        trans["JSONinputs"] = []
        # logger.info("input count",inCount
        # let's cycle through inputs
        for i in xrange(0, inCount):
            input_num = i
            input_tx = getBigEndian(tx[counter:counter + 64])
            input_index = tx[counter + 64:counter + 72]
            input_scriptLen = tx[counter + 72: counter + 74]

            # if input_index == "FF FF FF FF" then the index = -1
            if input_index == "ffffffff":
                input_index = -1
            else:
                input_index = getLitEndian(input_index)
            # now we need to check if the input script is > 255 bytes or not
            if input_scriptLen != "fd":  # > 255 bytes
                scriptLen = int(input_scriptLen, 16) * 2
                counter += 74
            elif input_scriptLen == "fd" and len(
                    access.getrawtransaction(
                        bInfo["tx"][r], 1
                    )["vin"][i]["scriptSig"]["hex"]
            ) >= 506:
                # 0xfd = 253 in decimal and so 253*2 = 506
                scriptLen = getLitEndian(tx[counter + 74:counter + 78]) * 2
                counter += 78
            else:  # input_scriptLen == 'fd'
                scriptLen = int(input_scriptLen, 16) * 2
                counter += 74
            input_script = tx[counter:counter + scriptLen]
            counter += scriptLen
            # input_sequence is the seperator 'FF FF FF FF' for inputs and outputs
            input_sequence = tx[counter:counter + 8]
            counter += 8

            input_details = {
                "in_num": input_num,
                "in_tx": input_tx,
                "in_index": input_index,
                "in_script": input_script,
                "address": "",
                "in_val": 0
            }
            trans["inputs"].append(input_details)
            trans["JSONinputs"].append(Json(input_details))
            # logger.info("input:num,tx,index,script_len,sequence", input_num, input_tx,
            # input_index, input_sequence

        # --------------------OUTPUT PARSING------------------------------
        # let's get output count
        tx_outCount = tx[counter:counter + 2]
        # logger.info(tx_outCount
        if tx_outCount != "fd":  # < 255 outputs
            outCount = int(tx_outCount, 16)
            counter += 2
        elif tx_outCount == "fd" and len(access.getrawtransaction(bInfo["tx"][r], 1)[
                                             "vout"]) >= 255:  # > 255 outputs
            outCount = getLitEndian(tx[counter + 2:counter + 6])
            counter += 6
        else:  # the actual hex byte === fd --> exactly 253 outputs
            outCount = int(tx_outCount, 16)
            counter += 2
        trans["out_count"] = outCount
        trans["outputs"] = []
        trans["out_total"] = 0
        trans["JSONoutputs"] = []
        trans["out_txs"] = []
        # logger.info("outCount", outCount
        # let's cycle through the outputs
        for o in xrange(0, outCount):
            out_num = o
            trans["out_txs"].append('unspent')
            out_val = tx[counter:counter + 16]
            out_type = tx[counter + 16:counter + 18]
            output_Val = getLitEndian(out_val)
            # logger.info("out:Val,type",out_val,out_type
            capture_details = True
            if out_val == "0000000000000000":
                out_scriptLen = out_type
                # outScriptLenInt = int(out_scriptLen,16)*2
                # counter += 18 + outScriptLenInt
                if out_scriptLen == "00":
                    output_type = "None"
                    address = "None"
                    hash160 = "None"
                    outScript = "00"
                    outScript_decode = "00"
                    counter += 18
                else:  # ------------- OP_RETURNS ---------------------
                    # let's check if the OP_RETURN script length is >= 255 bytes
                    if out_type == "fd" and len(
                            access.getrawtransaction(bInfo["tx"][r], 1)["vout"][out_num][
                                "scriptPubKey"]["hex"]) >= 506:
                        logger.info("OP_RETURN script length is greater than 255 bytes")
                        byte_len = tx[counter + 18:counter + 22]
                        logger.info("out_type", out_type)
                        logger.info("byte_len", byte_len)
                        OP_length = getLitEndian(byte_len) * 2
                        logger.info("OP_length", OP_length)
                        counter += 22
                    else:
                        OP_length = int(out_type, 16) * 2
                        counter += 18
                    OP_length = int(out_type, 16) * 2
                    counter += 18
                    OP_type = tx[
                              counter:counter + 4]  # i.e '6A51' == OP_RETURN OP_1 // or // '6A52' == OP_RETURN OP_2 // etc.
                    OP_stringLen = int(tx[counter + 4:counter + 6], 16) * 2
                    OP = ''
                    OP_message = ''
                    outScript = tx[counter:counter + 6 + OP_stringLen]  # raw script
                    if OP_type == "6a51":
                        OP_message = tx[counter + 6:counter + 6 + OP_stringLen]
                        OP = "OP_RETURN OP_1 "
                        # logger.info("OP_RETURN OP_1", OP_message
                    elif OP_type == "6a52":
                        OP_message = tx[counter + 6:counter + 6 + OP_stringLen]
                        OP = "OP_RETURN OP_2 "
                        # logger.info("OP_RETURN OP_2", OP_message
                    address = "NonStandard"
                    hash160 = "None"
                    outScript_decode = OP + OP_message
                    output_type = "NonStandard"
                    counter += OP_length
            else:  # there is some value being received
                # logger.info(output_Val,"BKC"
                if out_type == "19":  # P2PH
                    outScript = tx[counter + 18:counter + 68]
                    outScript_decode = (
                        "OP_DUP OP_HASH160 " +
                        tx[counter + 24:counter + 64] +
                        " OP_EQUALVERIFY OP_CHECKSIG"
                    )
                    address = tx[counter + 24:counter + 64]
                    hash160 = tx[counter + 24:counter + 64]
                    output_type = "pubkeyhash"
                    counter += 68
                elif out_type == "17":  # multi-sig output
                    outScript = tx[counter + 20:counter + 66]
                    outScript_decode = "OP_HASH160 " + tx[
                                                       counter + 22:counter + 62] + " OP_EQUAL"
                    address = tx[counter + 22:counter + 62]
                    hash160 = tx[counter + 22:counter + 62]
                    output_type = "p2sh"
                    counter += 64
                elif out_type == "23":  # P2P
                    outScript = tx[counter + 20:counter + 88]
                    outScript_decode = tx[counter + 20:counter + 86] + " OP_CHECKSIG"
                    address = tx[counter + 20:counter + 86]
                    hash160 = getHash160(tx[counter + 20:counter + 86])
                    output_type = "pubkey"
                    counter += 88
                elif out_type == "43":  # P2P
                    outScript = tx[counter + 20:counter + 152]
                    outScript_decode = tx[counter + 20:counter + 150] + " OP_CHECKSIG"
                    address = tx[counter + 20:counter + 150]
                    hash160 = getHash160(tx[counter + 20:counter + 150])
                    output_type = "pubkey"
                    counter += 152
                else:
                    print("Unknown address type", out_type)
                    return

            output_details = {
                "out_num": out_num,
                "out_val": output_Val,
                "address": address,
                "hash160": hash160 if hash160 else '',
                "script": {
                    "raw": outScript if outScript else '',
                    "decode": outScript_decode if outScript_decode else ''
                },
                "type": output_type if output_type else ''
            }
            trans["out_total"] += output_Val
            trans["outputs"].append(output_details)

            # block solved by no one in genesis block
            if r == 0 and o == 0 and bHeight == 0:
                block["solvedby"] = "None"
            # block solved by 2nd output in 2nd transaction of block
            elif r == 1 and o == 1 and bType == "proof-of-stake":
                block["solvedby"] = getAddress(address, "38")
                trans["coinstake"] = True
                trans["coinagedestroyed"] = bCoinageDestroyed
            # block solved by 1st output in 1st transaction of block
            elif r == 0 and o == 0 and bType == "proof-of-work":
                block["solvedby"] = getAddress(address, "38")

        if r == bNumTx - 1:  # the last transaction in the block; it's succeded by a block-end-script
            lockTime = tx[counter:counter + 8]
            if lockTime != "00000000":
                logger.info(tx[h:counter + 10])
                print("Locktime is off!")
                return
            tx_type = tx[counter + 8:counter + 10]
            tx_hash = computeTransHash(tx[h:counter + 10])
            endScriptLen = tx[counter + 10:counter + 12]
            endScriptLen_int = int(endScriptLen, 16) * 2
            endScript = tx[counter + 12:counter + 12 + endScriptLen_int]
            counter += 12 + endScriptLen_int
            # logger.info("locktime,tx_type", lockTime, tx_type)
        else:  # not the last transaction in the block
            lockTime = tx[counter:counter + 8]
            tx_type = tx[counter + 8:counter + 10]
            counter += 10
            tx_hash = computeTransHash(tx[h:counter])
            # logger.info("locktime,tx_type", lockTime, tx_type)
        trans["id"] = tx_hash
        trans["type"] = tx_type
        trans["blockhash"] = bHash
        trans["blockheight"] = bHeight
        trans["tx_num"] = r
        trans["addresses"] = set()

        # block information
        if tx_type == "38":
            block["numTx_bks"] += 1
            block["tx_received_bks"] += trans["out_total"]
        else:
            block["numTx_bkc"] += 1
            block["tx_received_bkc"] += output_Val

        # save the transaction
        tx_hash = trans["id"]
        cursor.execute("SELECT height FROM transactions WHERE id = %s;", (tx_hash,))
        if cursor.rowcount == 0:
            tx_type = trans["type"]
            tx_inCount = trans["in_count"]
            tx_outCount = trans["out_count"]
            tx_chain = trans["chain"]
            if tx_type == "38":
                address_type = "BKS"
            else:
                address_type = "BKC"

            for o in xrange(0, tx_outCount):
                output_type = trans["outputs"][o]["type"]
                if output_type == "pubkey":
                    trans["outputs"][o]["address"] = getAddress(
                        trans["outputs"][o]["address"],
                        tx_type)
                    trans["addresses"].add(trans["outputs"][o]["address"])
                elif output_type == "pubkeyhash":
                    trans["outputs"][o]["address"] = getAddress20byte(
                        trans["outputs"][o]["address"], tx_type)
                    trans["addresses"].add(trans["outputs"][o]["address"])
                elif output_type == "p2sh":
                    trans["outputs"][o]["address"] = getAddress20byteP2SH(
                        trans["outputs"][o]["address"], tx_type)
                    trans["addresses"].add(trans["outputs"][o]["address"])
                trans["JSONoutputs"].append(Json(trans["outputs"][o]))
                if trans["outputs"][o]["address"] != "None" and trans["outputs"][o][
                    "address"] != "NonStandard" and tx_chain == 'main':
                    if address_type == "BKS":
                        check_address = "SELECT id FROM address_bks WHERE id = %s LIMIT 1;"
                    else:  # BKC
                        check_address = "SELECT id FROM address_bkc WHERE id = %s LIMIT 1;"
                    check_data = (trans["outputs"][o]["address"],)
                    cursor.execute(check_address, check_data)
                    if cursor.rowcount == 0:
                        if address_type == "BKS":
                            insert_address = "INSERT INTO address_bks (id, hash160, numtx, " \
                                             "total_sent, total_received, \
                                                                                 balance," \
                                             "type) VALUES (%s,%s,%s,%s,%s,%s,%s);"
                        else:  # BKC
                            insert_address = "INSERT INTO address_bkc (id, hash160, numtx, " \
                                             "total_sent, total_received, \
                                                                                 balance," \
                                             "type) VALUES (%s,%s,%s,%s,%s,%s,%s);"
                        insert_address_data = (trans["outputs"][o]["address"],
                                               trans["outputs"][o]["hash160"],
                                               0,
                                               0,
                                               trans["outputs"][o]["out_val"],
                                               trans["outputs"][o]["out_val"],
                                               address_type,)
                        cursor.execute(insert_address, insert_address_data)
                        postgres.commit()
                    else:
                        if address_type == "BKS":
                            update_address_out = "UPDATE address_bks SET total_received = " \
                                                 "total_received + %s,\
                                                                                         balance = balance + %s WHERE id = %s;"
                        else:  # BKC
                            update_address_out = "UPDATE address_bkc SET total_received = " \
                                                 "total_received + %s,\
                                                                                       balance = balance + %s WHERE id = %s;"
                        update_address_out_data = (trans["outputs"][o]["out_val"],
                                                   trans["outputs"][o]["out_val"],
                                                   trans["outputs"][o]["address"],)
                        cursor.execute(update_address_out, update_address_out_data)
                        postgres.commit()

            insert_input_tx = "INSERT INTO input_txs (input_tx, input_index, txhash) VALUES" \
                              " (%s, %s, %s);"
            for i in xrange(0, tx_inCount):
                n = trans["inputs"][i]
                if n["in_index"] == -1:
                    n["address"] = "Coinbase"
                    n["in_val"] = 0

                else:
                    insert_input_data = (n["in_tx"], n["in_index"], tx_hash,)
                    try:
                        cursor.execute(insert_input_tx, insert_input_data)
                    except psycopg2.DataError:
                        print(insert_input_data)
                    postgres.commit()
                    # logger.info("input tran.",n["in_tx"]
                    # now let's find input addresses and amounts
                    input_tx = n["in_tx"]
                    input_index = n["in_index"]
                    # logger.info(input_tx,input_index
                    d_cursor.execute("SELECT * FROM transactions WHERE id = %s;",
                                     (input_tx,))
                    fetch = d_cursor.fetchone()
                    # logger.info(fetch
                    if type(fetch) == None:
                        d_cursor.execute(
                            "SELECT * FROM orphan_transactions WHERE id = %s;",
                            (input_tx,))
                        fetch = d_cursor.fetchone()

                    if fetch:
                        input_address = fetch["outputs"][input_index]["address"]
                        input_value = fetch["outputs"][input_index]["out_val"]
                        n["address"] = input_address
                        n["in_val"] = input_value
                        trans["in_total"] += input_value
                        trans["addresses"].add(input_address)

                    # now let's update the fetched transaction for out_txs
                    if tx_chain == 'main':
                        try:
                            cursor.execute(
                                "UPDATE transactions SET out_txs[%s] = %s WHERE id = %s;",
                                (input_index + 1, tx_hash, input_tx,)
                            )
                        except psycopg2.DataError:
                            print(
                                "UPDATE transactions SET out_txs[%s] = %s WHERE id = %s;",
                                (input_index + 1, tx_hash, input_tx,)
                            )
                        postgres.commit()
                    elif tx_chain == 'orphan':
                        cursor.execute(
                            "UPDATE orphan_transactions SET out_txs[%s] = %s WHERE id = %s;",
                            (input_index + 1, tx_hash, input_tx,))
                        postgres.commit()

                    if n["address"] != "Coinbase" and tx_chain == 'main':
                        if address_type == "BKS":
                            update_address_in = "UPDATE address_bks SET total_sent = " \
                                                "total_sent + %s,\
                                                                                  balance = " \
                                                "balance - %s WHERE id = %s;"
                        else:  # BKC
                            update_address_in = "UPDATE address_bkc SET total_sent = " \
                                                "total_sent + %s,\
                                                                                  balance = " \
                                                "balance - %s WHERE id = %s;"
                        update_address_in_data = (n["in_val"],
                                                  n["in_val"],
                                                  n["address"],)
                        cursor.execute(update_address_in, update_address_in_data)
                        postgres.commit()

            if tx_chain == 'main':
                insert_tx = "INSERT INTO transactions (id, ver, timestamp,\
                                                                           in_count, inputs, " \
                            "out_count, tx_num,\
                                                                   outputs, type, " \
                            "blockhash, height,chain,addresses,in_total,out_total, out_txs, " \
                            "coinstake, coinagedestroyed)\
                                                                    VALUES (%s,%s,%s,%s," \
                            "%s::jsonb[],%s,%s,%s::jsonb[],%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"
                insert_tx_data = (tx_hash, trans["ver"], trans["timestamp"], tx_inCount,
                                  trans["JSONinputs"], tx_outCount, trans["tx_num"],
                                  trans["JSONoutputs"],
                                  tx_type, trans["blockhash"], trans["blockheight"],
                                  trans["chain"],
                                  set2list(trans["addresses"]), trans["in_total"],
                                  int(trans["out_total"]), trans["out_txs"],
                                  trans["coinstake"],
                                  trans["coinagedestroyed"],)
                try:
                    cursor.execute(insert_tx, insert_tx_data)
                except psycopg2.DataError:
                    print(insert_tx_data)
                postgres.commit()
                logger.info("MAIN - just inserted,", tx_hash)
            else:
                cursor.execute("SELECT height FROM orphan_transactions WHERE id = %s;",
                               (tx_hash,))
                if cursor.rowcount == 0:
                    insert_tx = "INSERT INTO orphan_transactions (id, ver, timestamp,\
                                                                           in_count, inputs, " \
                                "out_count, tx_num,\
                                                                   outputs, type, " \
                                "blockhash, height,chain,addresses,in_total,out_total, " \
                                "out_txs, coinstake, coinagedestroyed)\
                                                                    VALUES (%s,%s,%s,%s," \
                                "%s::jsonb[],%s,%s,%s::jsonb[],%s,%s,%s,%s,%s,%s,%s,%s,%s," \
                                "%s);"

                    insert_tx_data = (
                    tx_hash, trans["ver"], trans["timestamp"], tx_inCount,
                    trans["JSONinputs"], tx_outCount, trans["tx_num"],
                    trans["JSONoutputs"],
                    tx_type, trans["blockhash"], trans["blockheight"],
                    trans["chain"],
                    set2list(trans["addresses"]), trans["in_total"],
                    trans["out_total"], trans["out_txs"], trans["coinstake"],
                    trans["coinagedestroyed"],)
                    cursor.execute(insert_tx, insert_tx_data)
                    postgres.commit()
                    logger.info("ORPHAN just inserted,", tx_hash)
            if tx_chain == 'main':
                for x in trans["addresses"]:
                    if address_type == "BKS":
                        update_numtx = "UPDATE address_bks SET numtx = numtx + 1 WHERE id = " \
                                       "%s;"
                    else:  # BKC
                        update_numtx = "UPDATE address_bkc SET numtx = numtx + 1 WHERE id =" \
                                       " %s;"
                    update_numtx_data = (x,)
                    cursor.execute(update_numtx, update_numtx_data)
                    postgres.commit()

            # hashtype table insert transaction
            insert_hash = "INSERT INTO hashtype (id, type, height, timestamp, chain) VALUES " \
                          "(%s, %s, %s, %s, %s);"
            insert_hash_data = (
                tx_hash, "tx_" + tx_type, trans["blockheight"], trans["timestamp"],
                trans["chain"],)
            cursor.execute(insert_hash, insert_hash_data)
            postgres.commit()

    # save the block
    chain = block["chain"]
    bHash = block["id"]
    if chain == 'main':
        cursor.execute("SELECT height FROM blocks where id = %s;", (bHash,))
        if cursor.rowcount == 0:
            insert_block = "INSERT INTO blocks (id, height, size, ver, timestamp, bits, " \
                           "difficulty,\
                                                            nonce, merkleroot, prevhash, " \
                           "type, chain, numtx,\
                                                            proofhash, modifier, " \
                           "modifierchecksum, mint, vote, tx_received_bks, solvedby, \
                                                            tx_received_bkc, numtx_bks, " \
                           "numtx_bkc, coinagedestroyed, txs, motions, custodians)\
                                                            VALUES (%s, %s, %s, %s, %s, %s, " \
                           "%s, \
                                                                    %s, %s, %s, %s, %s, %s, \
                                                                    %s, %s, %s, %s, %s, %s, " \
                           "%s, \
                                                                    %s, %s, %s, %s, %s, %s, " \
                           "%s);"
            insert_data = (
                block["id"], block["height"], block["size"], block["ver"],
                block["timestamp"], block["bits"],
                block["difficulty"],
                block["nonce"], block["merkleroot"], block["prevhash"], block["type"],
                block["chain"], block["numTx"],
                block["proofhash"], block["modifier"], block["modifierchecksum"],
                block["mint"],
                json.dumps(block["vote"]), block["tx_received_bks"],
                block["solvedby"], block["tx_received_bkc"], block["numTx_bks"],
                block["numTx_bkc"],
                block["coinagedestroyed"], block["txs"], block["motions"],
                block["custodians"],)
            logger.info("inserting %s on chain: %s" % (x, chain))
            try:
                cursor.execute(insert_block, insert_data)
            except psycopg2.DataError:
                print(insert_data)
            postgres.commit()
    elif chain == "orphan":
        cursor.execute("SELECT height FROM orphan_blocks where id = %s;", (bHash,))
        if cursor.rowcount == 0:
            insert_block = "INSERT INTO orphan_blocks (id, height, size, ver, timestamp, " \
                           "bits, difficulty,\
                                                            nonce, merkleroot, prevhash, " \
                           "type, chain, numtx,\
                                                            proofhash, modifier, " \
                           "modifierchecksum, mint, vote, tx_received_bks, solvedby, \
                                                            tx_received_bkc, numtx_bks, " \
                           "numtx_bkc, coinagedestroyed, txs, motions, custodians)\
                                                            VALUES (%s, %s, %s, %s, %s, %s, " \
                           "%s, \
                                                                    %s, %s, %s, %s, %s, %s, \
                                                                    %s, %s, %s, %s, %s, %s, " \
                           "%s, \
                                                                    %s, %s, %s, %s, %s, %s, " \
                           "%s);"

            insert_data = (
                block["id"], block["height"], block["size"], block["ver"],
                block["timestamp"], block["bits"],
                block["difficulty"],
                block["nonce"], block["merkleroot"], block["prevhash"], block["type"],
                block["chain"], block["numTx"],
                block["proofhash"], block["modifier"], block["modifierchecksum"],
                block["mint"],
                json.dumps(block["vote"]), block["tx_received_bks"],
                block["solvedby"], block["tx_received_bkc"], block["numTx_bks"],
                block["numTx_bkc"],
                block["coinagedestroyed"], block["txs"], block["motions"],
                block["custodians"],)
            logger.info("inserting %s on chain: %s" % (x, chain))
            cursor.execute(insert_block, insert_data)
            postgres.commit()

    # hashtype table insert block
    insert_hash = "INSERT INTO hashtype (id, type, height, timestamp, chain) VALUES (%s, " \
                  "%s, %s, %s, %s);"
    insert_hash_data = (
    block["id"], "block", block["height"], block["timestamp"], block["chain"],)
    cursor.execute(insert_hash, insert_hash_data)
    postgres.commit()


def main():
    start_time = time.time()
    logger.info("Current block count: ", access.getblockcount())

    # Linux Users
    blk01 = "/home/bcex/.bcexchange/blk0001.dat"
    blk02 = "/home/bcex/.bcexchange/blk0002.dat"
    blk = ""

    start_height = 100000
    
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
    logger.info("%s seconds for complete blockchain Parse" % elapsed_time)
    
    getInfo = access.getinfo()
    
    networkInfo = {
                    "height":getInfo["blocks"],
                    "moneysupply":getInfo["moneysupply"],
                    "connections":getInfo["connections"]
    }
    logger.info(networkInfo)
    
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
    logger.info("vote_start",vote_start,"vote-end",vote_end)
    # custodians
    for x in xrange(vote_start,vote_end):
        logger.info(vote_end - x,"Custodian more to go")
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
                                logger.info("updating!")
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
        logger.info(vote_end - x,"Motion more to go")
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
                    logger.info(latest_block,">",get_prev_info["latest_block"])
                    logger.info(numvotes,">",get_prev_info["numvotes"])
                    if latest_block > get_prev_info["latest_block"] and numvotes != get_prev_info["numvotes"] and get_prev_info["passed"] == False:
                        logger.info("updating!")
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
            logger.info("updating totalvotes!")
            cursor.execute("UPDATE motions SET totalvotes = %s WHERE id = %s;", (total_votes,t, ))
            postgres.commit()
    
    logger.info("Done")
    
    
if __name__ == '__main__':
    main()

