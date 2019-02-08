# generate_japan_mesh_master

Generates csv master files for the japan mesh codes from http://www.stat.go.jp/data/mesh/m_itiran.html


### Prepare:
```
npm i
```

### Generate csv files:
```
npm run generate
```

CSV files will be written to the `out/` folder with the following format:

```
"meshcode",
"meshcode_1000m",
"size",
"center_latitude",
"center_longitude",
"left_bottom_latitude",
"left_bottom_longitude",
"left_upper_latitude",
"left_upper_longitude",
"right_bottom_latitude",
"right_bottom_longitude",
"right_upper_latitude",
"right_upper_longitude"
```