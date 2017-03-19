"""
AUTHOR: JOHNY GEORGES
DATE: 29/04/2014
HEXHASHREVERSER IS USED FOR PREV.BLOCK[v] HASH, MERKLE ROOT, BITS, RAW BLOCK[v] HASH ETC.
GETDIFFICULT WILL SPIT OUT THE DIFFICULTY OF THE BLOCK
"""

from __future__ import division
from bitcoinrpc.authproxy import AuthServiceProxy
import psycopg2
from psycopg2.extras import Json
from settings import get_settings
import logging


def main():
        logger = logging.getLogger('charts')
        conf = get_settings()
        access = AuthServiceProxy("http://{}:{}@127.0.0.1:2240".format(
                conf['daemon_rpc']['username'],
                conf['daemon_rpc']['password']
        ))
        logger.info("Current block count: ", access.getblockcount())
        postgres = psycopg2.connect(
                database=conf['database']['database_name'],
                user=conf['database']['username'],
                port=5432,
                password=conf['database']['password']
        )
        cursor = postgres.cursor()
        cursor.execute("SELECT data from chart_info where id='diff_chart';")
        get_data = cursor.fetchall()[0][0]

        if len(get_data) == 0:
            # first time running this script
            chain_start = 1435118400  # JUNE 24 2015 12:00 AM
        else:
            # last_data holds the values for the last entry in the data array
            last_data = get_data[len(get_data)-1]
            chain_start = int(last_data[0])

        logger.info(chain_start)
        d_cursor = postgres.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        d_cursor.execute(
                "SELECT size,difficulty,numtx,coinagedestroyed,mint,timestamp,height "
                "FROM blocks WHERE timestamp >= %s ORDER BY height ASC;", (chain_start, )
        )
        get = d_cursor.fetchall()

        w = 86400  # ONE DAY OF SECONDS
        # height 401 = 1435995300 timestamp
        one_day = chain_start + w
        size_count = 0.0
        diff_count = 0.0
        blocks_count = 0
        numtx_count = 0
        cd_count = 0.0
        mint_count = 0.0
        num_blocks = len(get)
        size_list = []
        diff_list = []
        block_list = []
        numtx_list = []
        cd_list = []
        mint_list = []
        for x in get:
                height = x["height"]
                timestamp = x["timestamp"]
                size = x["size"]
                difficulty = float(x["difficulty"])
                numtx = x["numtx"]
                coinagedestroyed = x["coinagedestroyed"]
                mint = float(x["mint"])
                if timestamp <= one_day:
                        # print "working on day worth of blocks"
                        num_blocks += 1
                        size_count += size
                        diff_count += difficulty
                        blocks_count += 1
                        numtx_count += numtx
                        cd_count += coinagedestroyed
                        mint_count += mint
                elif height == 401:
                        logger.info("height is 401")
                        avg_size = size_count//num_blocks
                        avg_diff = diff_count/num_blocks
                        avg_blocks = blocks_count
                        avg_numtx = numtx_count//num_blocks
                        avg_cd = cd_count/num_blocks
                        avg_mint = mint_count/num_blocks
                        logger.info(
                                avg_size, avg_diff, avg_blocks, "avg_numtx->",
                                avg_numtx, avg_cd, avg_mint, num_blocks, height
                        )
                        size_list.append([str(one_day), str(avg_size)])
                        diff_list.append([str(one_day), str(avg_diff)])
                        block_list.append([str(one_day), str(avg_blocks)])
                        numtx_list.append([str(one_day), str(avg_numtx)])
                        cd_list.append([str(one_day), str(avg_cd)])
                        mint_list.append([str(one_day), str(avg_mint)])
                        one_day = 1435982400 + w  # JULY 4th timestamp,
                        avg_size = 0.0
                        avg_diff = 0.0
                        avg_blocks = 0
                        avg_numtx = 0
                        avg_cd = 0.0
                        avg_mint = 0.0
                        size_count = 0.0
                        diff_count = 0.0
                        blocks_count = 0
                        numtx_count = 0
                        cd_count = 0.0
                        mint_count = 0.0
                        # print one_day,timestamp
                elif timestamp > one_day:
                        # print "time for new block"
                        avg_size = size_count//num_blocks
                        avg_diff = diff_count/num_blocks
                        avg_blocks = blocks_count
                        avg_numtx = numtx_count//num_blocks
                        avg_cd = cd_count/num_blocks
                        avg_mint = mint_count/num_blocks
                        logger.info(
                                avg_size,avg_diff,avg_blocks,"avg_numtx->",avg_numtx,
                                avg_cd,avg_mint,num_blocks,height
                        )
                        size_list.append([str(one_day),str(avg_size)])
                        diff_list.append([str(one_day),str(avg_diff)])
                        block_list.append([str(one_day),str(avg_blocks)])
                        numtx_list.append([str(one_day),str(avg_numtx)])
                        cd_list.append([str(one_day),str(avg_cd)])
                        mint_list.append([str(one_day),str(avg_mint)])
                        one_day += 86400
                        avg_size = 0.0
                        avg_diff = 0.0
                        avg_blocks = 0
                        avg_numtx = 0
                        avg_cd = 0.0
                        avg_mint = 0.0
                        size_count = 0.0
                        diff_count = 0.0
                        blocks_count = 0
                        numtx_count = 0
                        cd_count = 0.0
                        mint_count = 0.0
                        # print one_day,timestamp

        #print "size_list",size_list
        #print "diff_list",diff_list
        #print "block_list",block_list
        #print "numtx_list",numtx_list
        #print "cd_list",cd_list
        #print "mint_list",mint_list

        # cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('size_chart',size_list, ))
        # postgres.commit()
        # cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('diff_chart',diff_list, ))
        # postgres.commit()
        # cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('block_chart',block_list, ))
        # postgres.commit()
        # cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('numtx_chart',numtx_list, ))
        # postgres.commit()
        # cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('cd_chart',cd_list, ))
        # postgres.commit()
        # cursor.execute("INSERT INTO chart_info (id,data) VALUES (%s,%s);",('mint_chart',mint_list, ))
        # postgres.commit()

        cursor.execute("UPDATE chart_info SET data = data || %s WHERE id = %s;",(size_list,'size_chart', ))
        postgres.commit()
        cursor.execute("UPDATE chart_info SET data = data || %s WHERE id = %s;",(diff_list,'diff_chart', ))
        postgres.commit()
        cursor.execute("UPDATE chart_info SET data = data || %s WHERE id = %s;",(block_list,'block_chart', ))
        postgres.commit()
        cursor.execute("UPDATE chart_info SET data = data || %s WHERE id = %s;",(numtx_list,'numtx_chart', ))
        postgres.commit()
        cursor.execute("UPDATE chart_info SET data = data || %s WHERE id = %s;",(cd_list,'cd_chart', ))
        postgres.commit()
        cursor.execute("UPDATE chart_info SET data = data || %s WHERE id = %s;",(mint_list,'mint_chart', ))
        postgres.commit()


if __name__ == '__main__':
        main()
