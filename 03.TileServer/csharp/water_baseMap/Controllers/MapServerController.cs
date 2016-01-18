using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace water_baseMap.Controllers
{
    public class MapServerController : Controller
    {
        //
        // GET: /MapServer/
        public FileResult tile(int z,int y,int x)
        {
            return getTile(z, y, x, 0);
        }

        public FileResult tile1(int z, int y, int x)
        {
            return getTile(z, y, x, 1);
        }
        public FileResult tile2(int z, int y, int x)
        {
            return getTile(z, y, x, 2);
        }
        public FileResult tile3(int z, int y, int x)
        {
            return getTile(z, y, x, 3);
        }
        public FileResult tile4(int z, int y, int x)
        {
            return getTile(z, y, x, 4);
        }
        public FileResult tile5(int z, int y, int x)
        {
            return getTile(z, y, x, 5);
        }
        public FileResult tile6(int z, int y, int x)
        {
            return getTile(z, y, x, 6);
        }
        public FileResult tile7(int z, int y, int x)
        {
            return getTile(z, y, x, 7);
        }
        public FileResult tile8(int z, int y, int x)
        {
            return getTile(z, y, x, 8);
        }
        public FileResult tile9(int z, int y, int x)
        {
            return getTile(z, y, x, 9);
        }

        private FileResult getTile(int z, int y, int x, int idx)
        {
            string sIndex = string.Empty;
            if (idx > 0)
            {
                sIndex = idx.ToString();
            }
            string tilePath = ConfigurationManager.AppSettings["tilePath" + sIndex];
            string fileExt = ConfigurationManager.AppSettings["fileExt" + sIndex];
            string tileType = ConfigurationManager.AppSettings["tileType" + sIndex];
            string blankImgPath = Server.MapPath(ConfigurationManager.AppSettings["blankImagePath"]);
            string filePath = string.Empty;
            if (string.Compare(tileType, "gmap", true) == 0)
            {
                filePath = Path.Combine(tilePath, string.Format("{2}\\{0}\\{1}.{3}", x, y, z, fileExt));

            }
            else if (string.Compare(tileType, "esri", true) == 0)
            {
                filePath = Path.Combine(tilePath, string.Format("L{2}\\R{1}\\C{0}.{3}", string.Format("{0:x}", x).PadLeft(8, '0'), string.Format("{0:x}", y).PadLeft(8, '0'), string.Format("{0:x}", z).PadLeft(2, '0'), fileExt));
            }
            if (System.IO.File.Exists(filePath))
            {
                return File(filePath, "image/" + fileExt);
            }
            else
            {
                return File(blankImgPath,"image/png");
            }
        }

	}
}