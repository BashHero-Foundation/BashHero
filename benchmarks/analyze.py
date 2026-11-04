import json
import os

import matplotlib.pyplot as plt
import numpy as np

with open("benchmark-results/json-size.json") as f:
    json_size_data = json.load(f)

with open("benchmark-results/lzstring-size.json") as f:
    lzstring_size_data = json.load(f)

json_size_results = np.split(np.array(json_size_data['ys']), 10)
json_size_means = [values.mean() for values in json_size_results]

lzstring_size_results = np.split(np.array(lzstring_size_data['ys']), 10)
lzstring_size_means = [values.mean() for values in lzstring_size_results]

plots_path = "analyze-results"

if not os.path.isdir(plots_path):
    os.mkdir(plots_path)

plt.plot((np.arange(len(json_size_means)) * 10) + 1, json_size_means, marker = "o", label = "json string")
plt.plot((np.arange(len(lzstring_size_means)) * 10) + 1, lzstring_size_means, marker = "s", label = "lzstring")

plt.axhline(4096, color='red', linestyle = "--")
plt.legend()

plt.xlabel("liczba zapisanych poziomów")
plt.ylabel("liczba znaków wymaganych do zapisania")

plt.savefig(f"{plots_path}/size.png")

plt.ylim(0, 4400)
plt.savefig(f"{plots_path}/size-limited.png")
