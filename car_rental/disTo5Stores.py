import heapq
import json
import math
def getCoseFiveStores(locList):
    with open ('newLoc.json') as f:
        store = []
        tempDic = json.load(f)
        for j in range(len(tempDic["location"])):
            lats = float(locList[1])
            late = float(tempDic["location"][j]["geo"][1])
            lngs = float(locList[0])
            lnge = float(tempDic["location"][j]["geo"][0])
            distance = math.acos(math.sin(math.pi*lats/180.0)*math.sin(math.pi*late/180.0)+math.cos(math.pi*lats/180.0)*math.cos(math.pi*late/180.0)*math.cos(math.pi*lngs/180.0-math.pi*lnge/180.0))*3963
            if distance != 0:
                heapq.heappush(store, distance)
            
        for k in range (5):
            print(heapq.heappop(store))

if __name__ == "__main__":
    locList = [-118.1240209, 34.0914517]
    getCoseFiveStores(locList)
        
