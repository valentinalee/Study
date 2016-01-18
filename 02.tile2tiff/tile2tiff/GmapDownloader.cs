using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace tile2tiff
{
    class GmapDownloader
    {
        const double EarthRadius = 6378137;
        const double MinLatitude = -85.05112878;
        const double MaxLatitude = 85.05112878;
        const double MinLongitude = -180;
        const double MaxLongitude = 180;

        const string NameFormat = "{0}-{1}-{2}.png";
        const string TileSource = "https://mts{0}.google.com/vt/lyrs=m@207000000&hl=zh-CN&gl=CN&src=app&x={1}&y={2}&z={3}&s={4}";
        const string SourceTail = "Galileo";

        static Random rng = new Random();

        static double Clip(double n, double minValue, double maxValue)
        {
            return Math.Min(Math.Max(n, minValue), maxValue);
        }

        static void LatLongToTileXY(double latitude, double longitude, int levelOfDetail, out int tileX, out int tileY)
        {
            double x = (longitude + 180) / 360;
            double sinLatitude = Math.Sin(latitude * Math.PI / 180);
            double y = 0.5 - Math.Log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI);

            uint mapSize = 1u << levelOfDetail;
            tileX = (int)Clip(x * mapSize + 0.5, 0, mapSize - 1);
            tileY = (int)Clip(y * mapSize + 0.5, 0, mapSize - 1);
        }

        static bool Validate(int x, int y, int l)
        {
            bool ret = false;
            try
            {
                Bitmap bmp = new Bitmap(string.Format(NameFormat, x, y, l));
                ret = (bmp.Height == 256 && bmp.Width == 256);
                bmp.Dispose();
            }
            catch (Exception) { }
            return ret;
        }

        static void Download(int x, int y, int l)
        {
            try
            {
                WebClient client = new WebClient();
                client.Headers.Add("user-agent", "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:21.0) Gecko/20130109 Firefox/21.0");
                string loc = string.Format(TileSource, rng.Next(4), x, y, l,
                    SourceTail.Substring(0, rng.Next(SourceTail.Length)));
                string name = string.Format(NameFormat, x, y, l);
                client.DownloadFile(loc, name);
            }
            catch (Exception ex)
            {
                Console.WriteLine();
                Console.WriteLine(ex.Message);
            }
        }

        void run(string[] args)
        {
            try
            {
                Console.WriteLine("Google Map Tiles Downloader");
                Console.WriteLine("lat1, long1   lat2, long2   level");
                double[] array = new double[4];
                int level = 1, i = 0;
                string[] splits = Console.ReadLine().Split(' ', ',');
                foreach (string s in splits)
                {
                    if (s.Trim() == "")
                        continue;
                    if (i < 4) array[i++] = double.Parse(s);
                    else level = int.Parse(s);
                }
                double lat1 = Clip(array[0], MinLatitude, MaxLatitude);
                double lat2 = Clip(array[2], MinLatitude, MaxLatitude);
                double long1 = Clip(array[1], MinLongitude, MaxLongitude);
                double long2 = Clip(array[3], MinLongitude, MaxLongitude);
                if (level < 1) level = 1;
                if (level > 19) level = 19;

                Console.WriteLine("Generating download list...");
                List<int> list = new List<int>();
                for (i = 1; i <= level; ++i)
                {
                    int x1, y1, x2, y2;
                    LatLongToTileXY(lat1, long1, i, out x1, out y1);
                    LatLongToTileXY(lat2, long2, i, out x2, out y2);
                    for (int u = x1; u <= x2; ++u)
                        for (int v = y1; v <= y2; ++v)
                        {
                            list.Add(u);
                            list.Add(v);
                            list.Add(i);
                        }
                }
                Console.WriteLine(list.Count / 3 + " in list");

                Console.WriteLine("Validating existing tiles...");
                List<int> dlist = new List<int>();
                for (i = 0; i < list.Count; i += 3)
                {
                    int x = list[i], y = list[i + 1], l = list[i + 2];
                    if (Validate(x, y, l))
                        continue;
                    dlist.Add(x);
                    dlist.Add(y);
                    dlist.Add(l);
                }
                Console.WriteLine(dlist.Count / 3 + " to download");
                if (dlist.Count == 0)
                    return;

                Console.WriteLine("Press ENTER");
                Console.ReadLine();
                for (i = 0; i < dlist.Count; i += 3)
                {
                    int x = dlist[i], y = dlist[i + 1], l = dlist[i + 2];
                    Console.Write("\rDownloading " + i / 3);
                    Download(x, y, l);
                }

                Console.WriteLine();
                Console.WriteLine("Done.");
            }
            catch (Exception ex)
            {
                Console.WriteLine();
                Console.WriteLine(ex.Message);
                Console.WriteLine(ex.Source);
                Console.WriteLine(ex.StackTrace);
                Console.WriteLine();
            }
        }

    }
}
