export function qSort<T>(array: T[], compareFn: (a: T, b: T) => number): T[] {
    return quicksort(array, 0, array.length - 1, compareFn, 3);
};

function swap<T>(array: T[], i: number, j: number): void {
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
};

function quicksort<T>(array: T[], left: number, right: number, compareFn: (a: T, b: T) => number, divider: number): T[] {
    let length = right - left;

    if (length < 27) {
        for (let i = left + 1; i <= right; i++) {
            for (let j = i; j > left && compareFn(array[j], array[j - 1]) < 0; j--) {
                swap(array, j, j - 1);
            }
        }
        return array;
    }

    let third = ~~(length / divider);
    let m1 = left + third;
    let m2 = right - third;

    if (m1 <= left) {
        m1 = left + 1;
    }
    if (m2 >= right) {
        m2 = right - 1;
    }

    if (compareFn(array[m1], array[m2]) < 0) {
        swap(array, m1, left);
        swap(array, m2, right);
    } else {
        swap(array, m1, right);
        swap(array, m2, left);
    }

    let pivot1 = array[left];
    let pivot2 = array[right];

    let less = left + 1;
    let more = right - 1;

    for (let i = less; i <= more; i++) {
        if (compareFn(array[i], pivot1) < 0) {
            swap(array, i, less++);
        } else if (compareFn(array[i], pivot2) > 0) {
            while (i < more && compareFn(array[more], pivot2) > 0) {
                --more;
            }
            swap(array, i, more--);
            if (compareFn(array[i], pivot1) < 0) {
                swap(array, i, less++);
            }
        }
    }
    let dist = more - less;
    if (dist < 13) {
        ++divider;
    }
    swap(array, less - 1, left);
    swap(array, more + 1, right);
    quicksort(array, left, less - 2, compareFn, divider);
    quicksort(array, more + 2, right, compareFn, divider);

    if (dist > length - 13 && pivot1 !== pivot2) {
        for (let i = less; i <= more; i++) {
            if (array[i] === pivot1) {
                swap(array, i, less++);
            } else if (array[i] === pivot2) {
                swap(array, i, more--);
                if (array[i] === pivot1) {
                    swap(array, i, less++);
                }
            }
        }
    }

    if (compareFn(pivot1, pivot2) < 0) {
        return quicksort(array, less, more, compareFn, divider);
    }
    return array;
};