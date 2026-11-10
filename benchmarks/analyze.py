import json
import os

import matplotlib.pyplot as plt
import numpy as np

SIZE_DIFF = 10

with open("benchmark-results/json-size.json") as f:
    json_size_data = json.load(f)

with open("benchmark-results/lzstring-size.json") as f:
    lzstring_size_data = json.load(f)

xs = [x[0] for x in np.split(np.array(json_size_data['xs']), len(np.unique(json_size_data['xs'])))]

json_size_results = np.split(np.array(json_size_data['ys']), len(xs))
json_size_means = [values.mean() for values in json_size_results]

lzstring_size_results = np.split(np.array(lzstring_size_data['ys']), len(xs))
lzstring_size_means = [values.mean() for values in lzstring_size_results]

plots_path = "analyze-results"

if not os.path.isdir(plots_path):
    os.mkdir(plots_path)

plt.axhline(4096, color='red', linestyle = "--", label = "maximum")

plt.plot(xs, json_size_means, marker = "o", label = "json string")
plt.plot(xs, lzstring_size_means, marker = "s", label = "lzstring")

plt.grid(True)
plt.legend()

plt.xlabel("liczba zapisanych poziomów")
plt.ylabel("liczba znaków wymaganych do zapisania")

plt.savefig(f"{plots_path}/encoded-size-comparison.png")

plt.ylim(0, 4400)
plt.savefig(f"{plots_path}/encoded-size-comparison-limited.png")


lzstring_size_ratio = np.split(np.array(json_size_data['ys']) / np.array(lzstring_size_data['ys']),len(np.unique(json_size_data['xs'])))
lzstring_size_ratio_means = [values.mean() for values in lzstring_size_ratio]

minimal_size_ratio = np.split(np.array(json_size_data['ys']) / np.full(shape=len(json_size_data['ys']), fill_value=4096),len(np.unique(json_size_data['xs'])))
minimal_size_ratio_means = [values.mean() for values in minimal_size_ratio]

plt.clf()

plt.plot(xs, minimal_size_ratio_means, label = "minimal ratio", color='red', linestyle = "--")
plt.plot(xs, lzstring_size_ratio_means, marker = "s", label = "lzstring")
plt.grid(True)
plt.legend()
plt.savefig(f"{plots_path}/encoded-size-ratio-comparison.png")
